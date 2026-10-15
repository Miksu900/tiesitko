# Luo jakokuvat (og/*.png). Käyttö: python3 scripts/og.py  (tarvitsee Pillow + Inter-fontin)
import json, textwrap
from PIL import Image, ImageDraw, ImageFont
IB="/usr/share/fonts/opentype/inter/Inter-Bold.otf"; IX="/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"; IM="/usr/share/fonts/opentype/inter/Inter-Medium.otf"
COL={"tuet":(27,79,216),"terveys":(14,159,110),"kuluttaja":(232,89,12),"velat":(142,63,209),"verot":(194,24,91),"tyo":(8,145,178),"turva":(91,100,117)}
BLUE=(11,42,111); HI=(255,210,63); W,H=1200,630
d=json.load(open("aiheet.json")); kats={k["id"]:k["nimi"] for k in d["kategoriat"]}
def F(p,s): return ImageFont.truetype(p,s)
def logo(dr,x,y,s=54):
    f=F(IX,s); dr.text((x,y),"Tiesitkö",font=f,fill=(255,255,255))
    w=dr.textlength("Tiesitkö",font=f)
    dr.rounded_rectangle([x+w+10,y+4,x+w+10+s*0.8,y+s*1.05],10,fill=HI)
    dr.text((x+w+10+s*0.4,y+s*0.55),"?",font=f,fill=(58,44,0),anchor="mm")
def wrap(dr,t,f,maxw):
    out=[];cur=""
    for w in t.split():
        c=(cur+" "+w).strip()
        if dr.textlength(c,font=f)<=maxw: cur=c
        else: out.append(cur);cur=w
    out.append(cur);return out
def card(title,sub,col,path):
    im=Image.new("RGB",(W,H),BLUE);dr=ImageDraw.Draw(im)
    dr.rectangle([0,0,18,H],fill=col)
    logo(dr,70,52)
    if sub: dr.text((70,150),sub,font=F(IM,30),fill=(180,198,240))
    s=68
    while True:
        f=F(IX,s);ls=wrap(dr,title,f,W-160)
        if len(ls)<=4 or s<44: break
        s-=4
    y=210
    for l in ls: dr.text((70,y),l,font=f,fill=(255,255,255));y+=int(s*1.18)
    dr.text((70,H-70),"Virallinen lähde jokaisessa aiheessa",font=F(IM,28),fill=HI)
    im.save(path,optimize=True)
card("50 asiaa, jotka kannattaa tietää: tukia, oikeuksia ja ilmaisia palveluja","",(255,210,63),"og/oletus.png")
for a in d["aiheet"]:
    card(a["otsikko"],kats[a["kat"]],COL[a["kat"]],f"og/{a['slug']}.png")
print(len(d["aiheet"])+1,"kuvaa")
