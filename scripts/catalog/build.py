import os
import json, re, math, html, os, sys, unicodedata, collections
sys.path.insert(0, os.path.dirname(__file__))
from taxonomy import RULES, SUBCATS, COLORS_NL, HEX, BLOCK_NAMES
W=os.path.join(os.path.dirname(os.path.abspath(__file__)),'source')+'/'
d=json.load(open(W+'octagonshop-katalog.json')); P=d['prods']; DESCS=d['descs']
EN={x['id']:x for x in json.load(open(W+'octagonshop-katalog-en.json'))}
NLT=json.load(open(W+'nl_desc.json')) if os.path.exists(W+'nl_desc.json') else {}
ENT=json.load(open(W+'en_desc_fix.json')) if os.path.exists(W+'en_desc_fix.json') else {}
CONFIG={'plnPerEur':4.25,'markupPct':15}

ALLOWED={'p','br','ul','ol','li','strong','b','em','h4'}
def clean_html(h):
    if not h or 'MsoNormal' in h or 'Style Definitions' in h:
        h=re.sub(r'(?s)Normal 0 \d+ false.*?\}\s*','',h)
    h=re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>','',h)
    h=re.sub(r'(?is)<!--.*?-->','',h)
    h=re.sub(r'</?(span|font|a|u|i|div)[^>]*>', lambda m: '' if m.group(1)!='div' else ('</p><p>' if True else ''), h)
    h=re.sub(r'<(/?)(\w+)[^>]*>', lambda m: f'<{m.group(1)}{m.group(2).lower()}>' if m.group(2).lower() in ALLOWED else '', h)
    h=h.replace('<b>','<strong>').replace('</b>','</strong>').replace('&nbsp;',' ').replace('\xa0',' ')
    h=re.sub(r'\s+',' ',h)
    for _ in range(3):
        h=re.sub(r'<p>\s*(<br>\s*)*</p>','',h); h=re.sub(r'<strong>\s*</strong>','',h)
    h=re.sub(r'(<br>\s*){3,}','<br><br>',h)
    h=re.sub(r'^(\s*(<br>|</p>)\s*)+','',h).strip()
    if h and not h.startswith('<'): h='<p>'+h
    # balance p tags roughly
    if h.count('<p>')>h.count('</p>'): h+='</p>'*(h.count('<p>')-h.count('</p>'))
    h=re.sub(r'^</p>','',h)
    return h.strip()

def text(h): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).strip()

def slugify(s):
    s=s.lower().replace('ł','l')
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')

def price_eur(pln):
    x=pln/CONFIG['plnPerEur']*(1+CONFIG['markupPct']/100)
    return round(math.ceil(x)-0.01,2)

def translate_tail_nl(tail):
    t=tail
    keys=sorted(COLORS_NL,key=len,reverse=True)
    alt='|'.join(re.escape(k) for k in keys)
    # pary kolorów X/Y – bez względu na wielkość liter
    t=re.sub(r'(?i)(?<![\w])('+alt+r')\s*/\s*('+alt+r')(?![\w])',lambda m: COLORS_NL[m.group(1).lower()]+'/'+COLORS_NL[m.group(2).lower()],t)
    # pojedyncze kolory tylko pisane małą literą (nazwy modeli są z wielkiej)
    t=re.sub(r'(?<![\w])('+alt+r')(?![\w])',lambda m: COLORS_NL[m.group(1)],t)
    rep={'krótki rękaw':'korte mouw','długi rękaw':'lange mouw','z kapturem':'met capuchon','bez kaptura':'zonder capuchon',
         'plecakoworek GRATIS':'GRATIS gymbag','GRATIS':'GRATIS','skóra':'leer','SKÓRA':'LEER','wypełniony':'gevuld','niewypełniony':'ongevuld',
         'z funkcją plecaka':'met rugzakfunctie','damskie':'','damski':'','dziecięce':'','dziecięcy':'','męskie':'','sportowy':'',
         'czarna':'zwart','Piszczel/Stopa':'','piszczel/stopa':'','2w1':'2-in-1',' - 2szt':' (2 stuks)','2szt':'(2 stuks)','Rękawica bokserska':'bokshandschoen','Maska Hokejowa':'Hockeymasker',' cup':' beker','na rzep':'met klittenband'}
    for k,v in rep.items(): t=re.sub(re.escape(k),v,t,flags=re.I)
    return re.sub(r'\s+',' ',t).strip(' /-')

NLCOL=sorted(set(COLORS_NL.values()),key=len,reverse=True)
def color_of(name_nl):
    tail=name_nl.split('Octagon')[-1].lower()
    hits=[]
    for c in NLCOL:
        for m in re.finditer(r'(?<![\w])'+re.escape(c)+r'(?![\w])',tail):
            if not any(a<=m.start()<b for a,b,_ in hits): hits.append((m.start(),m.end(),c))
    found=[]
    for _,_,c in sorted(hits):
        if c not in found: found.append(c)
    if not found: return []
    nm=' / '.join(found[:2])
    return [{'name':nm,'hex':HEX.get(found[0],'#444444')}]

SPORT={'bokshandschoenen':['boxing','kickboxing','muay-thai'],'mma-handschoenen':['mma'],'scheenbeschermers':['kickboxing','muay-thai','mma'],
 'bokshelmen':['boxing','kickboxing'],'gebitsbeschermers':['boxing','kickboxing','mma','muay-thai'],'bandages':['boxing','kickboxing','muay-thai','mma'],
 'overige-bescherming':['mma','kickboxing'],'kimonos':['karate'],'stootkussens':['boxing','kickboxing','muay-thai'],'bokszakken':['boxing','kickboxing'],
 'medicijnballen':['fitness'],'rashguards':['grappling','mma'],'mma-shorts':['mma','grappling'],'kickboxing-shorts':['kickboxing','muay-thai'],
 'compressieshorts':['mma','grappling'],'sportshirts':['fitness'],'tanktops':['fitness'],'leggings':['fitness']}

# grupy wariantów (union-find)
par={p['id']:p['id'] for p in P}
def f(x):
    while par[x]!=x: par[x]=par[par[x]]; x=par[x]
    return x
for p in P:
    for v in p['variants']:
        if v in par: par[f(v)]=f(p['id'])

out=[]; skipped=[]; slugs=set(); unmatched=[]
for p in P:
    name=p['name'].strip(); low=name.lower()
    rule=next(((k,nl) for rx,k,nl in RULES if re.search(rx,low)),'?')
    if rule=='?': unmatched.append(name); continue
    key,nlpre=rule
    if key is None: skipped.append(name); continue
    cat,subnl,suben,subpl=SUBCATS[key]
    crumbs=p['crumbs']; top=crumbs[0] if crumbs else ''
    sizes=[v for a in p['attrs'] for v in a['values']]
    sizes=['One size' if s.upper()=='UNIWERSALNY' else s.replace('year','jaar') for s in sizes]
    kidsize=any(re.match(r'^\d+/\d+$|jaar|^\d{3}$|^\d+cm$',s) for s in sizes)
    if 'dziecię' in low or top=='Dziecięce' or kidsize: gender='kids'
    elif 'damsk' in low or (top=='Damskie' and key in ('t-shirts','leggings','tanktops','hoodies')): gender='women'
    elif cat=='kleding': gender='men'
    else: gender='unisex'
    if cat=='kleding': category={'kids':'kids','women':'dames'}.get(gender,'heren')
    else: category=cat
    en=EN[p['id']]; name_en=en['name'].strip()
    # NL nazwa
    m=re.search(r'\b(Legion Octagon|LEGION OCTAGON|Octagon|OCTAGON)\b',name)
    if nlpre and m: name_nl=nlpre+' '+translate_tail_nl(name[m.start():])
    elif key=='bandages' and m: name_nl=('Gel bandages ' if 'żelowe' in low else 'Boksbandages ')+translate_tail_nl(name[m.start():])
    elif nlpre: name_nl=nlpre+' '+translate_tail_nl(re.sub(r'^\S+\s*','',name)) if key=='bivakmutsen' else nlpre
    else: name_nl=name
    if key=='bivakmutsen' and not m: name_nl='Bivakmuts '+translate_tail_nl(name[len('Kominiarka'):].strip() or 'Octagon')
    name_nl=re.sub(r'\s+',' ',name_nl).strip()
    GR=r'\s*\+\s*(GRATIS gymbag|plecakoworek GRATIS|.*backpack.*|.*GRATIS.*)$'
    name_nl=re.sub(GR,'',name_nl,flags=re.I); name_disp_pl=re.sub(GR,'',name,flags=re.I)
    base=slugify(name_nl); s=base; i=2
    while s in slugs: s=f'{base}-{i}'; i+=1
    slugs.add(s)
    prices=p['prices']; pln=prices[-1]
    if pln<=0: skipped.append(name); continue
    sale=len(prices)>1 and prices[0]>prices[-1]
    dk=str(p['descIdx'])
    desc_pl=clean_html(DESCS[p['descIdx']])
    desc_en=ENT.get(dk) or clean_html(en['descHtml'])
    if text(desc_en)==text(desc_pl): desc_en=ENT.get(dk,'')
    desc_nl=NLT.get(dk,'')
    mat=re.search(r'(?i)(skład|materiał)\s*:?\s*([^<]{4,90})',desc_pl)
    imgs=['/products/'+os.path.splitext(os.path.basename(u))[0]+'.webp' for u in p['imgs']]
    published=bool(imgs) and not (key=='bivakmutsen' and BLOCK_NAMES.search(name))
    out.append({
      'id':'oct-'+p['id'],'supplierId':p['id'],'supplierUrl':f"https://octagonshop.pl/p{p['id']},{slugify(name)}.html",
      'slug':s,'name':name_nl,'name_en':re.sub(r'\s*\+\s*.*$','',name_en) if '+' in name_en and re.search(r'(?i)free|gratis|backpack|bag',name_en.split('+')[-1]) else name_en,'name_pl':name_disp_pl,'brand':'LEGION OCTAGON' if 'legion' in low else 'OCTAGON',
      'descKey':dk,'category':category,'subcategory':key,'sport':SPORT.get(key,[]),'gender':gender,
      'material':(mat.group(2).strip(' .;') if mat else ''),'colors':color_of(name_nl),'sizes':sizes or ['One size'],
      'supplierPricePln':pln,'price':price_eur(pln),'isSale':sale,
      'stock':p['stock'] if p['stock'] is not None else 10,'images':imgs,'isNew':int(p['id'])>=5900,
      'variantGroup':'g'+f(p['id']),'published':published,
    })
    out[-1]['_d']=(desc_nl,desc_en,desc_pl)
# opisy deduplikowane
descs={}
for o in out:
    nl,en,pl=o.pop('_d'); descs[o['descKey']]={'nl':nl,'en':en,'pl':pl}
groups=collections.defaultdict(list)
for o in out: groups[o['variantGroup']].append(o['id'])
for o in out: o['variantIds']=[x for x in groups[o['variantGroup']] if x!=o['id']]; del o['variantGroup']
json.dump({'config':CONFIG,'generatedFrom':'octagonshop.pl','products':out,'descriptions':descs},open(W+'catalog.json','w'),ensure_ascii=False)
print('products',len(out),'published',sum(o['published'] for o in out),'skipped',len(skipped),'unmatched',unmatched)
print(collections.Counter(o['category'] for o in out)); print(collections.Counter(o['gender'] for o in out))
print('no NL desc',sum(1 for k,v in descs.items() if not v['nl']),'no EN desc',sum(1 for k,v in descs.items() if not v['en']),'of',len(descs))
