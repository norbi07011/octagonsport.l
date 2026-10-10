import os
import json,re,html,os,shutil
W=os.path.join(os.path.dirname(os.path.abspath(__file__)),'source')+'/'; S=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))+'/'
c=json.load(open(W+'catalog.json'))
from taxonomy import SUBCATS
def plain(h): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).strip()
def short(h):
    m=re.search(r'<p>(.*?)</p>',h or '')
    t=plain(m.group(1) if m else (h or ''))
    t=re.sub(r'^(Marka|OCTAGON brand presents|Brand)\b.*?(prezentuje|presents)\s*','',t)
    if len(t)>150:
        cut=t[:150]; t=cut[:cut.rfind(' ')]+'…'
    return t
D=c['descriptions']
FIX=json.load(open(W+'image_fixes.json'))
out=[]
for p in c['products']:
    d=D[p['descKey']]
    p=dict(p)
    if p['supplierId'] in FIX: p['images']=FIX[p['supplierId']]
    p['group']=min([p['id']]+p['variantIds'],key=lambda x:int(x.split('-')[1]))
    del p['variantIds']; p.pop('supplierUrl',None); p['pricePln']=p.pop('supplierPricePln'); p.pop('price',None)
    mm=re.search(r'<li>Materiaal: ([^<]+)</li>',d['nl']); p['material']=html.unescape(mm.group(1)) if mm else ''
    p['short']={'nl':short(d['nl']),'en':short(d['en'] or d['nl']),'pl':short(d['pl'])}
    out.append(p)
subcats={k:{'category':v[0],'nl':v[1],'en':v[2],'pl':v[3]} for k,v in SUBCATS.items()}
os.makedirs(S+'src/data',exist_ok=True); os.makedirs(S+'public/data',exist_ok=True)
json.dump({'config':c['config'],'subcategories':subcats,'products':out},open(S+'src/data/catalog.json','w'),ensure_ascii=False,separators=(',',':'))
for lang in ('nl','en','pl'):
    json.dump({k:(v[lang] or v['nl']) for k,v in D.items()},open(S+f'public/data/desc-{lang}.json','w'),ensure_ascii=False,separators=(',',':'))
# zdjęcia
dst=S+'public/products'; os.makedirs(dst,exist_ok=True)
need={os.path.basename(i) for p in out for i in p['images']}
if os.path.isdir(W+'webp'):
    for f in need: shutil.copy(W+'webp/'+f,dst+'/'+f)
missing=[f for f in need if not os.path.exists(dst+'/'+f)]
if missing: print('UWAGA: brak zdjęć w public/products:',len(missing))
print(len(out),'products; images',len(need)); 
for f in ['src/data/catalog.json','public/data/desc-nl.json']: print(f,os.path.getsize(S+f))
