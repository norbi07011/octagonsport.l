import os
W=os.path.join(os.path.dirname(os.path.abspath(__file__)),'source')+'/'
import json,re,glob,html
src=json.load(open(os.path.join(W,'to_translate.json')))
entries={}; refs={}
for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'nl','*.txt'))):
    for block in re.split(r'^@@ ',open(f).read(),flags=re.M)[1:]:
        head,_,body=block.partition('\n')
        m=re.match(r'(\d+)(?:\s*=(\d+))?(?:\s*\[(.*)\])?',head.strip())
        k,ref,subs=m.groups()
        if ref: refs[k]=(ref,subs)
        else: entries[k]=body.strip()
def resolve(k,seen=()):
    if k in entries: return entries[k]
    ref,subs=refs[k]; t=resolve(ref)
    if subs:
        for pair in subs.split(';'):
            a,b=pair.split('=>'); t=t.replace(a.strip(),b.strip())
    return t
def to_html(t):
    out=[];ul=False
    for line in t.split('\n'):
        line=line.strip()
        if not line: continue
        e=html.escape(line,quote=False)
        if line.startswith('- '):
            if not ul: out.append('<ul>'); ul=True
            out.append('<li>'+e[2:]+'</li>')
        else:
            if ul: out.append('</ul>'); ul=False
            if line.startswith('## '): out.append('<h4>'+e[3:]+'</h4>')
            else: out.append('<p>'+e+'</p>')
    if ul: out.append('</ul>')
    return ''.join(out)
nl={k:to_html(resolve(k)) for k in src}
json.dump(nl,open(os.path.join(W,'nl_desc.json'),'w'),ensure_ascii=False)
# EN: brakujące EN bierzemy z klucza, do którego odwołuje się NL (jeśli ma EN)
enfix={}
def root(k):
    while k in refs: k=refs[k][0]
    return k
for k,v in src.items():
    if v['lang']=='pl':
        r=root(k)
        if src[r]['lang']=='en': enfix[k]=src[r]['html']
json.dump(enfix,open(os.path.join(W,'en_desc_fix.json'),'w'),ensure_ascii=False)
print('nl',len(nl),'enfix',len(enfix),'still no EN',sum(1 for k,v in src.items() if v['lang']=='pl')-len(enfix))
print(nl['123'][:400])
