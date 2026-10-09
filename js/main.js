(function(){
var cv=document.getElementById("c"),ctx=cv.getContext("2d",{alpha:false}),spacer=document.getElementById("spacer");
var seed=11,W=0,H=0,dpr=1,ds=0,last=performance.now(),t0=last,walking=false,wy=0,budget=0;
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
var paper="#EFEDE8",ink="#2B2B2D",cache=[{},{},{},{},{},{}],seen={};
var CW=480,M=40,S=1,U=800,RS=[.55,.6,.7,.8,.9,1],i1s=[0,0,0,0,0,0],lastD="",spd=90,vel=0,i0s=[0,0,0,0,0,0],frameStart=0,forceEnd=0,introEnd=0,EM=[],LT=[],CX0=0,CX1=0,bcost=[8,8,10,12,16,20],pool=[[],[],[],[],[],[]],qual=1,fr=0,fcount=0,KT=[0,.55,1],DEPTH=2,kEff=1,PIV=.5,offs=[0,0,0,0,0,0],prevDs=0,tNow=0,dayG=1,nightG=0,gX=-999,gA=0,gMoon=false,CYCLE=6000,lastN=-1,wantShot=false,ov=0,fogA=0,rainA=0,snowA=0,LIGHT=1;
var SP=[.1,.2,.34,.55,.8,1.15],BASE=[.46,.53,.6,.66,.79,.93],AMP=[.34,.26,.18,.14,.11,.05];

var ALPHA=[.38,.48,.6,.74,.88,1],LW=[.7,.8,.95,1.1,1.4,1.9];

function Hh(i,k){var x=(Math.imul(i|0,374761393)+Math.imul(k|0,668265263)+Math.imul(seed,1442695041))|0;
  x=Math.imul(x^(x>>>13),1274126177);x^=x>>>16;return (x>>>0)/4294967296}
function sm(a,b,t){t=Math.min(1,Math.max(0,(t-a)/(b-a)));return t*t*(3-2*t)}
function vn(x,k){var i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return Hh(i,k)*(1-u)+Hh(i+1,k)*u}
function fbm(x,k,o){var s=0,a=.5,t=0;for(var j=0;j<o;j++){s+=a*vn(x,k+j*13);t+=a;x*=2.03;a*=.5}return s/t}

function dAt(L,x){return (x-W*.5)/SP[L]}
function altN(d){return vn(d/3600,201)}
function wetN(d){return vn(d/3000+17,202)}
function fdN(d){return vn(d/2600+41,203)}
function fcov(L,x){var d=dAt(L,x);return sm(.58,.8,fdN(d)+.25*(wetN(d)-.5))*(1-sm(.6,.8,altN(d)))}
function lakeV(x){return vn(x/(1700*S),55)*(.15+1.0*Math.pow(wetN(dAt(4,x)),1.5))}
function lake(x){return sm(.55,.68,lakeV(x))}
function lerp(a,b,t){return a+(b-a)*t}
function rgba(h,a){var n=parseInt(h.slice(1),16);return "rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+a+")"}

function ridge(L,x){
  var b=BASE[L]*H,X=x/S;
  if(L<=2){var wx=X+(vn(X/700,3+L)-.5)*320,n=fbm(wx/[520,380,260][L],L*7+1,4),r=1-Math.abs(2*n-1),
      d=dAt(L,x),ty=vn(d/3100,70),shape=lerp(Math.pow(r,1.7),Math.pow(n,1.6)*1.1,sm(.45,.75,ty));
    if(ty<.28)shape=Math.min(shape,.5+.08*vn(X/90,8));
    var wP=(1-sm(.45,.75,ty))*sm(.2,.3,ty);
    if(wP>0){var cs=[420,340,260][L],c0=Math.floor(X/cs),pk=0,c,px,dx,ww,sh2;
      for(c=c0-1;c<=c0+1;c++){px=(c+.15+.7*Hh(c,700+L))*cs;dx=X-px;ww=cs*(dx<0?.55+.8*Hh(c,704+L):.7+1.1*Hh(c,708+L));
        sh2=(.3+.7*Hh(c,712+L))*Math.pow(Math.max(0,1-Math.abs(dx)/ww),1.2+.9*Hh(c,716+L));if(sh2>pk)pk=sh2}
      pk*=.9+.2*fbm(X/45,L+4,2)-.1*Math.abs(2*fbm(X/22,L+9,2)-1);
      shape=lerp(shape,Math.max(pk,shape*.5),wP)}
    var kz=sm(.82,.92,ty);if(kz>0)shape=lerp(shape,Math.min(1.05,Math.pow(fbm(wx/[210,160,120][L],L*5+2,3),3)*3),kz);
    return b-shape*(.15+.85*sm(.25,.8,altN(d)))*(.9+.2*vn(X/900,90+L))*H*AMP[L]}
  if(L===3)return b-fbm(X/300,31,3)*H*.14*(.7+.6*altN(dAt(3,x)))-vn(X/1400,33)*H*.05-H*.06*altN(dAt(3,x));
  if(L===4)return lerp(b-fbm(X/230,41,3)*H*.11*(.75+.5*altN(dAt(4,x)))-H*.03*altN(dAt(4,x)),.7*H,lake(x));
  return b-fbm(X/160,51,2)*H*.05;
}

var TINT=["#6C7782","#616B76","#555E69","#474E57","#3A3F46","#2B2B2D"],WA=[.15,.19,.23,.25,.22,.3];
var GR=[.22,.26,.3,.34,.38,.4],gpat=[];
function grainPat(g,L){
  if(gpat[L])return gpat[L];
  var T=320,c=document.createElement("canvas"),x=c.getContext("2d"),s=7+L,j,px,py,r,d,ox,oy;
  c.width=c.height=T;x.fillStyle=TINT[L];
  function rnd(){s=(Math.imul(s,1664525)+1013904223)|0;return (s>>>0)/4294967296}
  for(j=0;j<2600;j++){px=rnd()*T;py=rnd()*T;
    d=.5+.5*Math.sin(px/T*12.566+1.3)*Math.sin(py/T*18.85+.7);
    if(rnd()>.25+.75*d)continue;
    r=.5+rnd()*rnd()*2;x.globalAlpha=.2+.7*rnd();
    for(ox=-1;ox<=1;ox++)for(oy=-1;oy<=1;oy++){
      if(px+ox*T<-3||px+ox*T>T+3||py+oy*T<-3||py+oy*T>T+3)continue;
      x.beginPath();x.arc(px+ox*T,py+oy*T,r,0,6.3);x.fill()}}
  var p=g.createPattern(c,"repeat");
  try{p.setTransform(new DOMMatrix([.5,0,0,.5,0,0]))}catch(e){}
  return gpat[L]=p}
var EDG=[.05,.06,.07,.08,.09,.1];
function rim(g,xs,ys,L){
  var n=xs.length,k,p,W2=[[10,.4],[5,.6],[2.2,1]];
  g.save();poly(g,xs,ys);g.clip();g.strokeStyle=TINT[L];g.lineJoin="round";
  for(p=0;p<3;p++){g.lineWidth=W2[p][0];g.globalAlpha=EDG[L]*W2[p][1];g.beginPath();
    for(k=0;k<n;k++)k?g.lineTo(xs[k],ys[k]):g.moveTo(xs[k],ys[k]);g.stroke()}
  g.restore()}
function poly(g,xs,ys){var n=xs.length;g.beginPath();g.moveTo(xs[0],H+5);for(var k=0;k<n;k++)g.lineTo(xs[k],ys[k]);g.lineTo(xs[n-1],H+5);g.closePath()}
function pen(g,xs,ys,w,a,L){
  for(var k=0;k<xs.length-1;k++){var i=xs[k]/4,lf=sm(.3,.52,vn(xs[k]/150,540+L));if(lf<.02)continue;
    g.globalAlpha=a*lf*(.5+.6*Hh(i,500+L));g.lineWidth=w*(.6+.8*Hh(i,520));
    g.beginPath();g.moveTo(xs[k],ys[k]);g.lineTo(xs[k+1],ys[k+1]);g.stroke()}
}
function blob(g,cx,cy,r,col,al){
  var m=10,pts=[],a,p1,p2;
  for(a=0;a<m;a++){var th=a/m*6.2832,rr=r*(.8+.35*Hh((cx|0)+a*3,636+(cy|0)%7));pts.push([cx+Math.cos(th)*rr,cy+Math.sin(th)*rr*.85])}
  g.beginPath();g.moveTo((pts[0][0]+pts[m-1][0])/2,(pts[0][1]+pts[m-1][1])/2);
  for(a=0;a<m;a++){p1=pts[a];p2=pts[(a+1)%m];g.quadraticCurveTo(p1[0],p1[1],(p1[0]+p2[0])/2,(p1[1]+p2[1])/2)}
  g.closePath();g.globalAlpha=al;g.fillStyle=col;g.fill();g.globalAlpha=al*.7;g.strokeStyle=col;g.lineWidth=.7;g.stroke();
}

function pine(g,x,y,h,L,nr){
  var w=h*(nr?.11+.07*Hh(x|0,612):.2+.17*Hh(x|0,612)),n=Math.max(4,Math.round(h/(nr?5.5:7+4*Hh(x|0,613)))),ln=(Hh(x|0,610)-.5)*h*.06,col=TINT[Math.min(5,L+1)],i,f,yy,bw,cx,th=h*.9/n,Lp=[[x+ln,y-h]],Rp=[];
  for(i=0;i<n;i++){f=(i+1)/n;yy=y-h+h*.94*f;bw=w*(.22+.78*f)*(.85+.3*Hh(i+x,611));cx=x+ln*(1-f);
    Lp.push([cx-bw,yy],[cx-bw*.3,yy-th*.45]);Rp.push([cx+bw,yy],[cx+bw*.3,yy-th*.45])}
  g.beginPath();g.moveTo(Lp[0][0],Lp[0][1]);
  for(i=1;i<Lp.length;i++)g.lineTo(Lp[i][0],Lp[i][1]);
  for(i=Rp.length-1;i>=0;i--)g.lineTo(Rp[i][0],Rp[i][1]);
  g.closePath();g.globalAlpha=.78;g.fillStyle=col;g.fill();g.globalAlpha=.25;g.strokeStyle=col;g.lineWidth=.6;g.stroke();
  g.beginPath();g.moveTo(Lp[0][0],Lp[0][1]);for(i=0;i<Rp.length;i++)g.lineTo(Rp[i][0],Rp[i][1]);g.lineTo(x,y-h*.05);g.closePath();
  g.globalAlpha=.3;g.fillStyle=TINT[5];g.fill();
  g.globalAlpha=.85;g.fillRect(x-Math.max(.8,h*.025),y-h*.07,Math.max(1.6,h*.05),h*.1+2);
}

function oak(g,x,y,h,L,bare){
  var a=ALPHA[L]*.85,tw=Math.max(1.3,h*.05),bl=[],col=TINT[Math.min(5,L+1)];g.strokeStyle=TINT[5];g.lineCap="round";
  function br(bx,by,ang,len,w,d){
    var ex=bx+Math.sin(ang)*len,ey=by-Math.cos(ang)*len;
    g.globalAlpha=a;g.lineWidth=Math.max(.6,w);g.beginPath();g.moveTo(bx,by);
    g.quadraticCurveTo(bx+(ex-bx)*.3+(Hh(bx+d*7,630)-.5)*len*.35,by+(ey-by)*.6,ex,ey);g.stroke();
    if(d>0){var m=Hh(ex,631)>.5?3:2;for(var q=0;q<m;q++)br(ex,ey,ang+(q-(m-1)/2)*(.5+Hh(ex+q,632)*.45),len*(.64+Hh(ex,633+q)*.14),w*.6,d-1)}
    else bl.push([ex,ey])}
  br(x,y+2,(Hh(x|0,634)-.5)*.25,h*(bare?.34:.3),tw,(L>=4?3:2)+(bare?1:0));
  if(bare)return;
  bl.forEach(function(p){var r=h*(.13+.07*Hh(p[0],635)),s;
    blob(g,p[0],p[1],r,col,.26);blob(g,p[0]+r*.2,p[1]+r*.28,r*.62,TINT[5],.2);
    g.fillStyle=TINT[5];for(s=0;s<Math.min(12,r*.7);s++){g.globalAlpha=.15+.3*Hh(s+p[0],637);g.beginPath();
      g.arc(p[0]+(Hh(s+p[0],638)-.3)*r*1.3,p[1]+(Hh(s+p[0],639)-.2)*r,.5+Hh(s,640)*.9,0,6.3);g.fill()}});
}

function rock(g,x,y,s){
  // Build an irregular silhouette with more points for a craggy feel
  var n=11,P=[],a,th,r,px,py,k,cr;
  for(a=0;a<n;a++){
    th=-1.5708+a/n*6.2832;
    // vary radius heavily on top half, keep flat on bottom
    var topFrac=Math.max(0,-Math.sin(th));
    r=s*(.7+.55*Hh(x*3+a,620)*topFrac+.15*(1-topFrac));
    px=x+Math.cos(th)*r*1.3;
    py=Math.min(y,y-s*.38+Math.sin(th)*r*.72);
    P.push([px,py]);
  }
  // ground shadow
  g.fillStyle=TINT[5];g.globalAlpha=.18;
  g.beginPath();g.ellipse(x+s*.2,y+1,s*1.6,s*.16,0,0,6.3);g.fill();

  // helper: build the rock silhouette path (reused several times)
  function rockPath(){
    g.beginPath();g.moveTo(P[0][0],P[0][1]);
    for(a=1;a<n;a++)g.quadraticCurveTo(
      (P[a-1][0]+P[a][0])/2+(Hh(x+a,625)-.5)*s*.08,
      (P[a-1][1]+P[a][1])/2,
      P[a][0],P[a][1]);
    g.quadraticCurveTo((P[n-1][0]+P[0][0])/2,(P[n-1][1]+P[0][1])/2,P[0][0],P[0][1]);
    g.closePath();
  }

  // solid paper base — makes the rock opaque against the background
  rockPath();g.globalAlpha=1;g.fillStyle=paper;g.fill();

  // base wash — lightest tone, full shape
  rockPath();
  g.globalAlpha=.28;g.fillStyle=TINT[3];g.fill();

  // second wash — darker toward base, clipped to rock shape
  rockPath();g.save();g.clip();
  var wg=g.createLinearGradient(0,y-s*.8,0,y);
  wg.addColorStop(0,'rgba(0,0,0,0)');wg.addColorStop(1,'rgba(0,0,0,.18)');
  g.globalAlpha=1;g.fillStyle=wg;g.fillRect(x-s*2,y-s*.8,s*4,s*.8);
  g.restore();

  // lit face — top-left facet, paper-tinted
  g.beginPath();g.moveTo(x,y-s*.85);
  for(a=0;a<=Math.floor(n*.45);a++)g.lineTo(P[a][0],P[a][1]);
  g.lineTo(x-s*.1,y-s*.25);g.closePath();
  g.globalAlpha=.22;g.fillStyle=TINT[1];g.fill();

  // dark shadow facet — right lower face
  g.beginPath();g.moveTo(P[Math.floor(n*.45)][0],P[Math.floor(n*.45)][1]);
  for(a=Math.floor(n*.45);a<=Math.floor(n*.75);a++)g.lineTo(P[a][0],P[a][1]);
  g.lineTo(x+s*.05,y-s*.1);g.closePath();
  g.globalAlpha=.32;g.fillStyle=TINT[5];g.fill();

  // ink outline — variable weight
  g.strokeStyle=TINT[5];g.lineCap="round";g.lineJoin="round";
  g.lineWidth=Math.max(.8,s*.045);g.globalAlpha=.55;
  rockPath();g.stroke();

  // lighter broken line on top edge (dry-brush)
  g.lineWidth=Math.max(.5,s*.022);g.globalAlpha=.22;
  g.setLineDash([s*.18,s*.12]);
  g.beginPath();g.moveTo(P[0][0],P[0][1]);
  for(a=1;a<=Math.floor(n*.5);a++)g.lineTo(P[a][0],P[a][1]);
  g.stroke();g.setLineDash([]);

  // crevice / crack lines — 2-3 curved strokes down the face
  g.strokeStyle=TINT[5];g.lineWidth=Math.max(.5,s*.025);
  var nc=1+Math.floor(Hh(x|0,628)*2);
  for(cr=0;cr<nc;cr++){
    var cx0=x+(Hh(x+cr,629)-.38)*s*.8,cy0=y-s*(.6+.2*Hh(x+cr,630));
    var cx1=cx0+(Hh(x+cr,631)-.5)*s*.35,cy1=cy0+s*(.3+.2*Hh(x+cr,632));
    g.globalAlpha=.28+.18*Hh(x+cr,633);
    g.beginPath();g.moveTo(cx0,cy0);
    g.quadraticCurveTo(cx0+(Hh(x+cr,634)-.5)*s*.2,cy0+s*.15,cx1,cy1);
    g.stroke();
  }

  // moss/lichen dots — small filled dots scattered on upper face
  g.fillStyle=TINT[3];
  for(a=0;a<Math.min(18,s*.6);a++){
    var mx=x+(Hh(x+a,622)-.15)*s*1.1,my=y-s*(.15+Hh(x+a,623)*.7);
    g.globalAlpha=.18+.22*Hh(x+a,624);
    g.beginPath();g.arc(mx,my,.4+Hh(a,626)*.7,0,6.3);g.fill();
  }
  g.globalAlpha=1;
}

function bamboo(g,x,y,h,L){
  var n=3+Math.floor(Hh(x|0,670)*4),j,k,t,cx,lean,hh,lw=Math.max(1,h*.018),nd,lx,ly,side,f,front,col;
  g.fillStyle=TINT[5];g.globalAlpha=.14;g.beginPath();g.ellipse(x,y+1,h*.2,Math.max(1,h*.025),0,0,6.3);g.fill();
  g.lineCap="round";
  for(j=0;j<n;j++){cx=x+(j-n/2)*h*.07+(Hh(x+j,671)-.5)*h*.04;lean=(Hh(x+j,672)-.5)*h*.12;hh=h*(.7+.5*Hh(x+j,673));front=j%2;
    col=TINT[Math.min(5,L+(front?2:1))];
    g.strokeStyle=col;g.lineWidth=lw;g.globalAlpha=front?.78:.5;g.beginPath();g.moveTo(cx,y+1);g.quadraticCurveTo(cx+lean*.3,y-hh*.55,cx+lean,y-hh);g.stroke();
    nd=Math.max(3,Math.round(hh/(h*.14)));g.strokeStyle=TINT[5];g.lineWidth=Math.max(.7,lw*.7);g.globalAlpha=front?.65:.35;g.beginPath();
    for(k=1;k<nd;k++){t=k/nd;lx=cx+lean*(.6*t+.4*t*t);ly=y-hh*(1.1*t-.1*t*t);g.moveTo(lx-lw*.9,ly);g.lineTo(lx+lw*.9,ly)}g.stroke();
    g.strokeStyle=front?TINT[5]:TINT[3];g.lineWidth=Math.max(.7,h*.008);g.globalAlpha=front?.7:.45;g.beginPath();
    for(k=0;k<5;k++){t=.55+.45*k/4;lx=cx+lean*(.6*t+.4*t*t);ly=y-hh*(1.1*t-.1*t*t);side=k%2?1:-1;
      for(f=-1;f<=1;f++){g.moveTo(lx,ly);g.quadraticCurveTo(lx+side*h*(.06+.02*Math.abs(f)),ly+h*(f*.025-.015),lx+side*h*.13,ly+h*(.045+f*.04))}}
    g.stroke()}
}

function fkind(L,tx,r2,r3){
  var d=dAt(L,tx),al=altN(d),we=wetN(d);
  // wc = conifer (high altitude / ridge)
  // wb = bamboo (wet lowland)
  // wbi = birch (mid-altitude, near water edges)
  // wo = broadleaf oak zone (mid-low, drier)
  var wc=sm(.42,.62,al),
      wb=sm(.52,.70,we)*(1-wc)*(1-sm(.55,.7,al)),  // bamboo: wet AND low
      wbi=sm(.28,.48,we)*sm(.15,.45,al)*(1-wc)*.75, // birch: moist mid-slope
      wo=(1-wc)*(1-wb)*(1-wbi)*.85,
      u,tot;
  // L3 (foothills): pines on ridge, bamboo near water, oaks elsewhere
  if(L===3)return r2<.45+.35*wc?(wc>.45&&r3<.55?7:0):wb>.35?6:r3<.6?1:5;
  tot=wc+wb+wbi+wo+.1;u=r2*tot;
  if(u<wc)return r3<.5?7:0;u-=wc;   // narrow pine or wide pine
  if(u<wb)return 6;u-=wb;            // bamboo
  if(u<wbi)return 3;u-=wbi;          // birch
  if(u<wo)return r3<.75?1:5;         // oak or shrub
  return r3<.45?2:4}                  // birch fallback or gnarl

function shrub(g,x,y,h,L){var col=TINT[Math.min(5,L+1)];
  g.strokeStyle=TINT[5];g.lineWidth=Math.max(1,h*.04);g.lineCap="round";g.globalAlpha=.6;g.beginPath();g.moveTo(x,y+1);g.lineTo(x+(Hh(x|0,680)-.5)*h*.1,y-h*.5);g.stroke();
  blob(g,x,y-h*.62,h*.24,col,.34);blob(g,x+(Hh(x|0,681)-.5)*h*.26,y-h*.42,h*.17,col,.3)}

function cypress(g,x,y,h,L){
  // Slim Japanese/Italian cypress — narrow dark column, slightly irregular
  var w=h*.055+h*.025*Hh(x|0,650),  // much narrower than before
      ln=(Hh(x|0,651)-.5)*h*.04,    // slight lean
      col=TINT[Math.min(5,L+1)],
      t,i,bw,by;

  // trunk base
  g.fillStyle=TINT[5];g.globalAlpha=.85;
  g.fillRect(x-Math.max(.8,h*.018),y-h*.06,Math.max(1.6,h*.036),h*.07);

  // build silhouette as stacked irregular tiers rather than one smooth bezier
  // this gives the feathered, slightly lumpy look of a real cypress
  var nT=Math.max(6,Math.round(h/8));
  var Lp=[[x+ln,y-h]],Rp=[];
  for(i=0;i<nT;i++){
    var f=(i+1)/nT;
    by=y-h*(1-f);
    // width widens then narrows — widest around 60% up from base
    bw=w*(Math.sin(f*3.14)*1.1+.18)*(.88+.24*Hh(i+x,652));
    var jag=(Hh(i+x,653)-.5)*bw*.28;  // slight horizontal jag
    Lp.push([x+ln*(1-f)+jag-bw, by-h*.5/nT*.35]);
    Lp.push([x+ln*(1-f)+jag-bw*.45, by]);
    Rp.push([x+ln*(1-f)+jag+bw, by-h*.5/nT*.35]);
    Rp.push([x+ln*(1-f)+jag+bw*.45, by]);
  }

  // main dark fill
  g.beginPath();g.moveTo(Lp[0][0],Lp[0][1]);
  for(i=1;i<Lp.length;i++)g.lineTo(Lp[i][0],Lp[i][1]);
  for(i=Rp.length-1;i>=0;i--)g.lineTo(Rp[i][0],Rp[i][1]);
  g.lineTo(x,y);g.closePath();
  g.globalAlpha=.82;g.fillStyle=TINT[5];g.fill();

  // lit left face highlight — thin strip
  g.beginPath();g.moveTo(Lp[0][0],Lp[0][1]);
  for(i=1;i<Lp.length;i+=2)g.lineTo(Lp[i][0],Lp[i][1]);
  g.lineTo(x,y);g.closePath();
  g.globalAlpha=.18;g.fillStyle=TINT[1];g.fill();

  // interior foliage lines — short paper-colored strokes suggesting branch layers
  g.strokeStyle=paper;g.lineCap="round";
  for(t=0;t<Math.min(8,Math.round(h/12));t++){
    var frac=.1+t*.08+.04*Hh(x+t,654);
    var lx=x+ln*(1-frac),ly=y-h*frac;
    var fw=w*(Math.sin(frac*3.14)*.9+.2);
    g.lineWidth=Math.max(.4,fw*.25);
    g.globalAlpha=.18+.08*Hh(x+t,655);
    g.beginPath();g.moveTo(lx-fw*.6,ly+fw*.3);g.quadraticCurveTo(lx,ly-fw*.2,lx+fw*.6,ly+fw*.3);
    g.stroke();
  }

  // very faint outline
  g.strokeStyle=TINT[5];g.lineWidth=Math.max(.4,w*.18);g.globalAlpha=.25;
  g.beginPath();g.moveTo(Lp[0][0],Lp[0][1]);
  for(i=1;i<Lp.length;i++)g.lineTo(Lp[i][0],Lp[i][1]);
  for(i=Rp.length-1;i>=0;i--)g.lineTo(Rp[i][0],Rp[i][1]);
  g.lineTo(x,y);g.closePath();g.stroke();
}

function birch(g,x,y,h,L){
  var tw=Math.max(1.4,h*.035),lean=(Hh(x|0,651)-.5)*h*.12,col=TINT[Math.min(5,L+1)],tx=x+lean*.6,ty=y-h*.55,t,a,f,mx;
  g.lineCap="round";g.strokeStyle=TINT[3];g.lineWidth=tw+1.2;g.globalAlpha=.55;g.beginPath();g.moveTo(x,y+2);g.quadraticCurveTo(x+lean*.2,y-h*.3,tx,ty);g.stroke();
  g.strokeStyle=paper;g.lineWidth=tw;g.globalAlpha=.95;g.stroke();
  g.strokeStyle=TINT[5];g.lineWidth=1;g.globalAlpha=.7;g.beginPath();
  for(t=0;t<Math.min(9,h/9);t++){f=.1+t/10;mx=x+lean*.6*f*f;g.moveTo(mx-tw*.45,y-h*.55*f);g.lineTo(mx+tw*.45,y-h*.55*f)}g.stroke();
  g.lineWidth=.8;g.strokeStyle=TINT[4];g.globalAlpha=.6;g.beginPath();
  for(t=0;t<5;t++){a=(t-2)*.45;g.moveTo(tx,ty+h*.1*(t%2));g.quadraticCurveTo(tx+Math.sin(a)*h*.15,ty-h*.12,tx+Math.sin(a)*h*.3,ty-h*.3)}g.stroke();
  for(t=0;t<4;t++)blob(g,tx+(t-1.5)*h*.13,ty-h*(.18+.1*Hh(x+t,652)),h*(.11+.04*Hh(x+t,653)),col,.2);
  g.fillStyle=TINT[4];for(t=0;t<10;t++){g.globalAlpha=.3+.3*Hh(x+t,654);g.beginPath();g.arc(tx+(Hh(x+t,655)-.5)*h*.5,ty-h*(.1+.3*Hh(x+t,656)),.6+Hh(t,657),0,6.3);g.fill()}
}

function pad(g,cx,cy,w,h,col){
  var t,a,px,py;g.fillStyle=col;g.globalAlpha=.6;g.beginPath();g.ellipse(cx,cy,w,h*.07,0,0,6.3);g.fill();
  g.globalAlpha=.3;g.fillStyle=TINT[5];g.beginPath();g.ellipse(cx+w*.15,cy+h*.025,w*.8,h*.04,0,0,6.3);g.fill();
  g.strokeStyle=TINT[5];g.lineWidth=.8;g.globalAlpha=.6;g.beginPath();
  for(t=0;t<16;t++){a=3.14+t/15*3.14;px=cx+Math.cos(a)*w*.95;py=cy+Math.sin(a)*h*.065;g.moveTo(px,py);g.lineTo(px+Math.cos(a)*w*.12,py+Math.sin(a)*h*.04)}g.stroke();
}

function gnarl(g,x,y,h,L){
  var dir=Hh(x|0,660)<.5?-1:1,tw=Math.max(2,h*.06),tx=x+dir*h*.35,ty=y-h*.78,col=TINT[Math.min(5,L+1)];
  g.fillStyle=TINT[5];g.globalAlpha=.85;g.beginPath();
  g.moveTo(x-tw,y+2);g.bezierCurveTo(x-tw*.8,y-h*.35,x+dir*h*.3,y-h*.4,tx-tw*.35,ty);
  g.lineTo(tx+tw*.35,ty);g.bezierCurveTo(x+dir*h*.3+tw*.4,y-h*.4,x+tw*.8,y-h*.3,x+tw,y+2);g.closePath();g.fill();
  g.strokeStyle=TINT[5];g.lineWidth=Math.max(1,tw*.35);g.globalAlpha=.75;g.lineCap="round";g.beginPath();
  g.moveTo(x+dir*h*.12,y-h*.4);g.quadraticCurveTo(x-dir*h*.15,y-h*.5,x-dir*h*.32,y-h*.62);
  g.moveTo(tx-dir*h*.02,ty+h*.04);g.quadraticCurveTo(tx+dir*h*.12,ty+h*.02,tx+dir*h*.26,ty-h*.04);g.stroke();
  pad(g,tx,ty,h*.3,h,col);pad(g,x-dir*h*.32,y-h*.62,h*.22,h,col);pad(g,tx+dir*h*.26,ty-h*.04,h*.18,h,col);
}

function blade(g,x,y,len,lean,w){g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x+lean*.25,y-len*.55,x+lean,y-len);g.quadraticCurveTo(x+lean*.25+w*.7,y-len*.5,x+w,y);g.closePath();g.fill()}
function tuft(g,x,y,sz,L){
  var nb=4+Math.floor(Hh(x|0,640)*6),j,u,len,lean;
  g.fillStyle=TINT[5];g.globalAlpha=.12;g.beginPath();g.ellipse(x+sz*.12,y+1,sz*.35,sz*.06,0,0,6.3);g.fill();
  for(j=0;j<nb;j++){u=j/(nb-1)-.5;len=sz*(.45+.65*Hh(x+j,641));lean=u*sz*.7+(Hh(x+j,642)-.5)*sz*.25;
    g.fillStyle=TINT[j%3?5:4];g.globalAlpha=(L===5?.4:.28)+.45*Hh(x+j,643);
    blade(g,x+u*sz*.12,y,len,lean,Math.max(.6,sz*.03));
    if(L===5&&Hh(x+j,644)<.14){g.beginPath();g.ellipse(x+lean,y-len-sz*.05,sz*.025,sz*.07,0,0,6.3);g.fill()}}
}

function reeds(g,rx,ry,e){var nbl=3+Math.floor(Hh(e,432)*4),k3,rh,rl;
  for(k3=0;k3<nbl;k3++){rh=U*(.025+.03*Hh(e+k3,433));rl=(Hh(e+k3,434)-.5)*rh*.5;
    g.strokeStyle=TINT[5];g.lineWidth=1;g.globalAlpha=.55;g.beginPath();g.moveTo(rx+k3*2.5,ry);g.quadraticCurveTo(rx+k3*2.5+rl*.3,ry-rh*.6,rx+k3*2.5+rl,ry-rh);g.stroke();
    if(Hh(e+k3,435)<.5){g.fillStyle=TINT[5];g.globalAlpha=.75;g.beginPath();g.ellipse(rx+k3*2.5+rl*.9,ry-rh*.85,1.3,rh*.12,0,0,6.3);g.fill()}}}

function emit(x,y,s){if(x>=CX0&&x<CX1)EM.push({x:x,y:y,s:s,h:Hh(x|0,590)})}
function lamp(x,y,w,h){if(x>=CX0&&x<CX1)LT.push({x:x,y:y,w:w,h:h,o:Hh(x|0,591)*.7})}
function house(g,x,y,s,type,L,hs){
  var h,d,t,px;
  g.fillStyle=TINT[5];g.globalAlpha=.16;g.beginPath();g.ellipse(x+s*.15,y+1,s*.7,Math.max(1,s*.07),0,0,6.3);g.fill();
  if(type===0){
    // --- Farmhouse: tall or short body, thatched gabled roof ---
    h=s*(hs>.55?.95:.55);
    var rh=s*(.38+.12*Hh(x|0,700));   // roof height
    var rb=y-h;                         // roof base Y (= wall top)
    var ri=rb-rh;                       // roof peak Y
    var wl=x-s*.5,wr=x+s*.5;          // wall left/right

    // ground shadow
    g.fillStyle=TINT[5];g.globalAlpha=.12;
    g.beginPath();g.ellipse(x+s*.1,y+2,s*.55,s*.06,0,0,6.3);g.fill();

    // --- Wall body ---
    // base paper fill
    g.globalAlpha=.97;g.fillStyle=paper;g.fillRect(wl,rb,s,h);
    // subtle side shadow — right face is darker
    var wsg=g.createLinearGradient(wl,0,wr,0);
    wsg.addColorStop(0,'rgba(0,0,0,0)');wsg.addColorStop(1,'rgba(0,0,0,.13)');
    g.globalAlpha=1;g.fillStyle=wsg;g.fillRect(wl,rb,s,h);
    // horizontal plank/mud-wall lines — evenly spaced thin strokes
    g.strokeStyle=TINT[4];g.lineWidth=.55;g.lineCap="butt";
    var npl=Math.round(h/s*6);
    for(t=1;t<npl;t++){
      var ply=rb+h*t/npl;
      g.globalAlpha=.12+.06*Hh(x+t,701);
      g.beginPath();g.moveTo(wl+1,ply);g.lineTo(wr-1,ply);g.stroke();
    }
    // wall outline
    g.globalAlpha=.5;g.strokeStyle=TINT[5];g.lineWidth=.9;g.strokeRect(wl,rb,s,h);

    // --- Gabled thatched roof ---
    // main roof fill — dark ink, slightly warm
    g.globalAlpha=.92;g.fillStyle=TINT[5];
    g.beginPath();
    g.moveTo(wl-s*.06,rb+s*.02);   // left eave overhangs wall
    g.lineTo(x,ri);                 // peak
    g.lineTo(wr+s*.06,rb+s*.02);   // right eave
    g.lineTo(wr+s*.06,rb+s*.06);
    g.lineTo(wl-s*.06,rb+s*.06);
    g.closePath();g.fill();
    // lit left face of roof — lighter tone
    g.globalAlpha=.18;g.fillStyle=TINT[2];
    g.beginPath();
    g.moveTo(wl-s*.06,rb+s*.02);g.lineTo(x,ri);
    g.lineTo(x,rb+s*.04);g.lineTo(wl-s*.06,rb+s*.06);
    g.closePath();g.fill();
    // thatch texture — short parallel strokes angled with slope
    var tLines=Math.round(s*.22)+5;
    g.strokeStyle=paper;g.lineCap="round";
    // left slope
    g.save();
    g.beginPath();g.moveTo(wl-s*.07,rb+s*.02);g.lineTo(x,ri);g.lineTo(x,rb+s*.05);g.lineTo(wl-s*.07,rb+s*.06);g.closePath();g.clip();
    g.lineWidth=Math.max(.5,s*.018);
    for(t=0;t<tLines;t++){
      var tf=t/tLines;
      var tx0=lerp(wl-s*.06,x,tf),ty0=lerp(rb+s*.03,ri,tf);
      var tx1=tx0+s*.1*(1-tf)+2,ty1=ty0+s*.04;
      g.globalAlpha=.13+.1*Hh(x+t,702);
      g.beginPath();g.moveTo(tx0,ty0);g.lineTo(tx1,ty1);g.stroke();
    }
    g.restore();
    // right slope
    g.save();
    g.beginPath();g.moveTo(x,ri);g.lineTo(wr+s*.07,rb+s*.02);g.lineTo(wr+s*.07,rb+s*.06);g.lineTo(x,rb+s*.05);g.closePath();g.clip();
    for(t=0;t<tLines;t++){
      var tf2=t/tLines;
      var tx0r=lerp(x,wr+s*.06,tf2),ty0r=lerp(ri,rb+s*.03,tf2);
      g.globalAlpha=.10+.08*Hh(x+t,703);
      g.beginPath();g.moveTo(tx0r,ty0r);g.lineTo(tx0r+s*.1*(1-tf2)+2,ty0r+s*.04);g.stroke();
    }
    g.restore();
    // ridge cap
    g.strokeStyle=TINT[5];g.lineWidth=Math.max(1,s*.03);g.globalAlpha=.9;
    g.beginPath();g.moveTo(x-s*.04,ri+s*.01);g.lineTo(x+s*.04,ri+s*.01);g.stroke();
    // eave edge line
    g.lineWidth=Math.max(.7,s*.022);g.globalAlpha=.7;
    g.beginPath();g.moveTo(wl-s*.07,rb+s*.05);g.lineTo(wr+s*.07,rb+s*.05);g.stroke();

    // --- Windows: shutter style ---
    // two side windows, optionally a second floor pair
    var winW=s*.11,winH=s*.13;
    var winPositions=[[x-s*.26,rb+s*.2],[x+s*.15,rb+s*.2]];
    if(h>s*.8){winPositions.push([x-s*.26,rb+h*.55]);winPositions.push([x+s*.15,rb+h*.55]);}
    for(t=0;t<winPositions.length;t++){
      var wx=winPositions[t][0],wy=winPositions[t][1];
      // window recess shadow
      g.globalAlpha=.35;g.fillStyle=TINT[5];g.fillRect(wx,wy,winW,winH);
      // paper inner
      g.globalAlpha=.8;g.fillStyle=paper;g.fillRect(wx+winW*.1,wy+winH*.1,winW*.8,winH*.8);
      // shutter left
      g.globalAlpha=.75;g.fillStyle=TINT[4];
      g.fillRect(wx-winW*.25,wy,winW*.25,winH);
      // shutter right
      g.fillRect(wx+winW,wy,winW*.25,winH);
      // shutter planks
      g.strokeStyle=TINT[5];g.lineWidth=.5;g.globalAlpha=.4;
      var np=3;
      for(var sp=1;sp<np;sp++){
        g.beginPath();g.moveTo(wx-winW*.25,wy+winH*sp/np);g.lineTo(wx,wy+winH*sp/np);g.stroke();
        g.beginPath();g.moveTo(wx+winW,wy+winH*sp/np);g.lineTo(wx+winW*1.25,wy+winH*sp/np);g.stroke();
      }
      // window cross divider
      g.strokeStyle=TINT[5];g.lineWidth=.6;g.globalAlpha=.5;
      g.beginPath();
      g.moveTo(wx+winW*.5,wy+winH*.1);g.lineTo(wx+winW*.5,wy+winH*.9);
      g.moveTo(wx+winW*.1,wy+winH*.5);g.lineTo(wx+winW*.9,wy+winH*.5);
      g.stroke();
      lamp(wx+winW*.5,wy+winH*.5,winW*.7,winH*.7);
    }

    // --- Door ---
    var dw=s*.14,dh=s*.24;
    g.globalAlpha=.8;g.fillStyle=TINT[5];
    g.beginPath();
    g.moveTo(x-dw*.5,y);
    g.lineTo(x-dw*.5,y-dh);
    g.quadraticCurveTo(x,y-dh-dw*.35,x+dw*.5,y-dh);
    g.lineTo(x+dw*.5,y);
    g.closePath();g.fill();
    // door inner paper
    g.globalAlpha=.6;g.fillStyle=paper;
    g.beginPath();
    g.moveTo(x-dw*.3,y);g.lineTo(x-dw*.3,y-dh*.8);
    g.quadraticCurveTo(x,y-dh*.8-dw*.22,x+dw*.3,y-dh*.8);
    g.lineTo(x+dw*.3,y);g.closePath();g.fill();

    // --- Ink outline finish ---
    g.strokeStyle=TINT[5];g.lineWidth=.8;g.globalAlpha=.55;
    // roof outline
    g.beginPath();
    g.moveTo(wl-s*.06,rb+s*.06);g.lineTo(wl-s*.06,rb+s*.02);
    g.lineTo(x,ri);g.lineTo(wr+s*.06,rb+s*.02);g.lineTo(wr+s*.06,rb+s*.06);
    g.stroke();

    if(hs<.35)emit(x,ri-s*.04,s);
  }else if(type===1){
    h=s*.4;
    g.globalAlpha=.55;g.fillStyle=TINT[2];g.fillRect(x-s*.45,y-h,s*.9,h);g.globalAlpha=.2;g.fillStyle=TINT[5];g.fillRect(x+s*.15,y-h,s*.3,h);
    g.globalAlpha=.85;g.fillStyle=TINT[4];g.beginPath();g.moveTo(x-s*.62,y-h+s*.04);g.quadraticCurveTo(x-s*.5,y-h-s*.34,x,y-h-s*.36);
    g.quadraticCurveTo(x+s*.5,y-h-s*.34,x+s*.62,y-h+s*.04);g.closePath();g.fill();
    g.strokeStyle=TINT[5];g.lineWidth=.7;g.globalAlpha=.5;g.beginPath();
    for(t=0;t<7;t++){px=x-s*.58+t*s*.19;g.moveTo(px,y-h+s*.04);g.lineTo(px-1,y-h+s*.1)}g.stroke();
    g.fillStyle=TINT[5];g.globalAlpha=.75;g.fillRect(x-s*.07,y-s*.22,s*.14,s*.22);g.globalAlpha=.6;g.fillRect(x+s*.2,y-h+s*.1,s*.1,s*.1);
    g.globalAlpha=.85;g.fillRect(x+s*.28,y-h-s*.34,s*.1,s*.22);
    lamp(x+s*.25,y-h+s*.15,s*.1,s*.1);if(hs<.6)emit(x+s*.33,y-h-s*.36,s);
  }else if(type===2){
    g.strokeStyle=TINT[5];g.lineWidth=Math.max(1,s*.04);g.globalAlpha=.75;g.beginPath();
    for(t=0;t<4;t++){px=x-s*.4+t*s*.27;g.moveTo(px,y);g.lineTo(px,y+s*.5)}
    g.moveTo(x-s*.4,y+s*.22);g.lineTo(x+s*.41,y+s*.22);g.stroke();
    g.fillStyle=TINT[5];g.globalAlpha=.8;g.fillRect(x-s*.5,y-s*.05,s,s*.07);
    g.globalAlpha=.6;g.fillStyle=TINT[3];g.fillRect(x-s*.42,y-s*.5,s*.84,s*.46);
    g.globalAlpha=.88;g.fillStyle=TINT[5];g.beginPath();g.moveTo(x-s*.6,y-s*.46);g.quadraticCurveTo(x-s*.25,y-s*.52,x,y-s*.88);
    g.quadraticCurveTo(x+s*.25,y-s*.52,x+s*.6,y-s*.46);g.closePath();g.fill();
    g.globalAlpha=.7;g.fillStyle=paper;g.fillRect(x-s*.1,y-s*.4,s*.2,s*.2);lamp(x,y-s*.3,s*.2,s*.2);
    g.globalAlpha=.16;g.fillStyle=TINT[5];g.beginPath();g.ellipse(x,y+s*.58,s*.55,s*.07,0,0,6.3);g.fill();
  }else{
    g.strokeStyle=TINT[5];g.lineWidth=Math.max(1,s*.04);g.globalAlpha=.8;g.beginPath();
    g.moveTo(x-s*.38,y);g.lineTo(x-s*.38,y-s*.56);g.moveTo(x+s*.38,y);g.lineTo(x+s*.38,y-s*.56);g.moveTo(x-s*.38,y-s*.18);g.lineTo(x+s*.38,y-s*.18);g.stroke();
    g.globalAlpha=.88;g.fillStyle=TINT[5];g.beginPath();g.moveTo(x-s*.66,y-s*.6);g.quadraticCurveTo(x-s*.3,y-s*.58,x,y-s*.92);
    g.quadraticCurveTo(x+s*.3,y-s*.58,x+s*.66,y-s*.6);g.lineTo(x+s*.5,y-s*.54);g.lineTo(x-s*.5,y-s*.54);g.closePath();g.fill();
  }
}

function vsite(L,c){
  // Find the flattest, most habitable spot in chunk c for a village
  var CS=L===4?2400:3000,best=-9,bx=0,t,x,sc,N,flatW;
  // altitude gate: villages don't form on very high terrain
  if(Hh(c,300+L)>(L===4?.62:.45)*(1.5-1.2*altN(dAt(L,(c+.5)*CS))))return null;
  for(t=0;t<12;t++){  // more candidates for better flat-spot finding
    x=c*CS+(t+.2+.6*Hh(c*12+t,310))*CS/12;
    if(L===4&&lake(x)>.2)continue;
    // flatness over a wider window — villages need broad flat ground
    flatW=0;
    var fw;
    for(fw=-2;fw<=2;fw++)flatW+=Math.abs(ridge(L,x+fw*40)-ridge(L,x+(fw+1)*40))/40;
    flatW/=4;
    sc=(1-sm(.02,.4,flatW))                                      // strong flatness preference
      +(L===4&&(lake(x-240)>.55||lake(x+240)>.55)?.9:0)         // bonus: near water
      -(L===3?sm(.55,.75,altN(dAt(L,x)))*.7:0)                  // penalty: high altitude (L3)
      -.5*fcov(L,x)                                              // penalty: dense forest
      +.15*Hh(c*12+t,311);                                       // tiny random tiebreak
    if(sc>best){best=sc;bx=x}
  }
  if(best<0.85)return null;
  N=3+Math.floor(Hh(c,301)*6);
  return {x:bx,N:N,spr:(L===4?120:70)+N*(L===4?32:14)}
}

function village(g,L,x0,x1){
  var CS=L===4?2400:3000,c,k,m,v,list,byx,i2,hx,hy,dx,r,type,sz,nearW,tx,ty,th,a,b,dir;
  for(c=Math.floor(x0/CS);c<=Math.floor(x1/CS);c++){
    v=vsite(L,c);if(!v)continue;list=[];

    for(k=0;k<v.N;k++){
      // Organic clustering: houses fall off in density from centre
      // Use a Gaussian-like spread: most buildings near centre, outliers rare
      var spread=Hh(c*13+k,302)*2-1; // -1..1 uniform
      spread=spread*Math.abs(spread); // squared → bell-ish, still signed
      dx=k?spread*v.spr:0;
      hx=v.x+dx;
      if(L===4&&lake(hx)>.15)continue;
      // Slope check — skip if too steep at this exact spot
      if(Math.abs(ridge(L,hx+16)-ridge(L,hx-16))/32>.85)continue;
      nearW=L===4&&(lake(hx-160)>.55||lake(hx+160)>.55);
      r=Hh(c*13+k,305);
      // building type: headman's house (type 0) at centre, mix around it
      type=k===0?0:nearW&&r<.4?2:r<.55?0:r<.9?1:3;
      // size: centre house largest, outliers smaller
      var distFrac=Math.min(1,Math.abs(dx)/v.spr);
      sz=U*(L===4?.034:.016)*(.8+.45*Hh(c*13+k,304))*(k?1.1-distFrac*.4:1.5);
      hy=ridge(L,hx)+2;
      if(type===2){dir=lake(hx+160)>.55?1:-1;for(m=0;m<14&&lake(hx)<.6;m++)hx+=dir*20;hy=.7*H+4}
      // Overlap rejection
      for(m=0;m<list.length;m++)if(Math.abs(list[m].x-hx)<(sz+list[m].s)*.6)break;
      if(m<list.length)continue;
      list.push({x:hx,y:hy,s:sz,t:type,h:Hh(c*13+k,306)})
    }
    if(!list.length)continue;

    // Cleared ground ellipse — worn earth around the settlement
    g.fillStyle=paper;g.globalAlpha=.45;
    g.beginPath();g.ellipse(v.x,ridge(L,v.x)+4,v.spr*1.1,U*(L===4?.022:.012),0,0,6.3);g.fill();

    // IGUNE — satoyama protective tree clusters around each house (north/windward side)
    // In real satoyama: farmers planted igune groves on north/west to block wind
    for(k=0;k<list.length;k++){
      var hb=list[k];
      if(hb.t===2)continue; // boats don't get igune
      var ni=2+Math.floor(Hh(c*17+k,325)*3); // 2-4 igune trees per house
      for(m=0;m<ni;m++){
        // place trees behind and beside each house (north = up in 2D = smaller y)
        tx=hb.x+(Hh(c*17+k*5+m,326)-.5)*hb.s*1.8;
        ty=hb.y-hb.s*(.55+.3*Hh(c*17+k*5+m,327)); // behind (above) the house
        if(L===4&&lake(tx)>.15)continue;
        if(Math.abs(ridge(L,tx)-ty)>hb.s*.8)continue; // don't float in air
        th=hb.s*(.55+.35*Hh(c*17+k*5+m,328));
        // igune species: oaks and pines (traditional windbreak trees)
        if(Hh(c*17+k*5+m,329)<.55)oak(g,tx,ty,th,L,false);
        else pine(g,tx,ty,th,L);
      }
    }

    // Village perimeter trees — scattered at the edge of the clearing
    var nPeri=3+Math.floor(Hh(c*7,331)*4);
    for(k=0;k<nPeri;k++){
      var ang2=Hh(c*7+k,332)*6.2832;
      var rad2=v.spr*(.85+.35*Hh(c*7+k,333));
      tx=v.x+Math.cos(ang2)*rad2;
      ty=ridge(L,tx)+2;
      if(L===4&&lake(tx)>.15)continue;
      th=U*(L===4?.048:.022)*(.7+.5*Hh(c*7+k,334));
      if(Hh(c*7+k,335)<.5)oak(g,tx,ty,th,L,false);else birch(g,tx,ty,th,L);
    }

    // Paths between buildings — organic quadratic curves
    byx=list.slice().sort(function(p,q){return p.x-q.x});
    g.strokeStyle=paper;g.lineCap="round";
    g.lineWidth=Math.max(1.5,U*.003);g.globalAlpha=.55;g.beginPath();
    for(i2=0;i2<byx.length-1;i2++){
      a=byx[i2];b=byx[i2+1];
      if(a.t===2||b.t===2)continue;
      // path wiggles slightly for organic feel
      var mx=(a.x+b.x)/2+(Hh(i2+c,340)-.5)*20;
      var my=Math.max(a.y,b.y)+4+(Hh(i2+c,341)-.5)*6;
      g.moveTo(a.x,a.y+3);g.quadraticCurveTo(mx,my,b.x,b.y+3);
    }
    g.stroke();

    // Draw houses back-to-front (painter's order)
    list.sort(function(p,q){return p.y-q.y});
    for(k=0;k<list.length;k++)house(g,list[k].x,list[k].y,list[k].s,list[k].t,L,list[k].h);
  }
}

function build(L,i){
  var w0=Math.round((CW+2)*dpr*RS[L]*qual),h0=Math.round(H*dpr*RS[L]*qual),c=pool[L].pop()||document.createElement("canvas"),g;
  if(c.width!==w0||c.height!==h0){c.width=w0;c.height=h0}
  g=c.getContext("2d");
  if(!g){emergency();return null}
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.globalAlpha=1;g.globalCompositeOperation="source-over";g.setLineDash([]);
  g.scale(c.width/(CW+2),c.height/H);g.translate(-i*CW+1,0);
  CX0=i*CW;CX1=CX0+CW;EM=[];LT=[];
  var A=Math.floor((i*CW-M)/4)*4,n=Math.ceil((CW+2*M)/4)+2,xs=[],ys=[],sh=[],k,j,x,e,b=BASE[L]*H,col=TINT[L],top=b-H*AMP[L]-4,DM=[.09,.11,.13,.07,.05,0][L];
  for(k=0;k<n;k++){x=A+4*k;xs.push(x);ys.push(ridge(L,x))}
  for(k=0;k<n;k++){var s0=0;for(j=-2;j<=2;j++){var q=Math.min(n-2,Math.max(0,k+j));s0+=ys[q+1]-ys[q]}sh.push(sm(.25,2.4,s0/5))}
  g.lineCap="round";g.lineJoin="round";
  g.globalAlpha=1;g.fillStyle=paper;poly(g,xs,ys);g.fill();

  g.save();poly(g,xs,ys);g.clip();
  var gr=g.createLinearGradient(0,top,0,b+H*(L>=4?.14:.1)),w=WA[L];
  if(L<=3){gr.addColorStop(0,rgba(col,w*.25));gr.addColorStop(.35,rgba(col,w));gr.addColorStop(.8,rgba(col,w*.55));gr.addColorStop(1,rgba(col,0))}
  else{gr.addColorStop(0,rgba(col,w*.8));gr.addColorStop(1,rgba(col,w*1.5))}
  g.globalAlpha=1;g.fillStyle=gr;g.fillRect(xs[0],0,CW+2*M+8,H);g.restore();

  if(L<=4)for(j=0;j<3;j++){var dep=[];
    for(k=0;k<n;k++){var sn=L<=2?sm(0,.2,(b-ys[k])/(H*AMP[L])-.55):0,lk=L===4?lake(xs[k]):0;
      dep.push(sh[k]*H*DM*[1,.62,.34][j]*(.65+.7*vn(xs[k]/50,9+j))*(1-.92*sn)*(1-sm(.15,.3,lk)))}
    g.beginPath();g.moveTo(xs[0],ys[0]);for(k=0;k<n;k++)g.lineTo(xs[k],ys[k]);for(k=n-1;k>=0;k--)g.lineTo(xs[k],ys[k]+dep[k]);g.closePath();
    g.globalAlpha=L<=2?.06:.1;g.fillStyle=col;g.fill();g.strokeStyle=col;g.lineWidth=.7;g.stroke()}

  g.save();poly(g,xs,ys);g.clip();g.fillStyle=grainPat(g,L);g.globalAlpha=GR[L];g.fillRect(xs[0],0,CW+2*M+8,H);g.restore();
  if(L<=2){g.strokeStyle=col;g.lineWidth=.9;g.globalAlpha=.32;g.beginPath();
    for(k=2;k<n-3;k+=3)if(ys[k]<ys[k-1]&&ys[k]<=ys[k+1]&&Hh(xs[k]/4,96)<.7){
      var px=xs[k],py=ys[k]+2,len=(b-ys[k])*.5*(.4+Hh(px/4,97))+10,dr=ys[k+1]>ys[k]?1:-.4;
      g.moveTo(px,py);g.bezierCurveTo(px+dr*len*.15,py+len*.35,px+dr*len*.3+(Hh(px,98)-.5)*8,py+len*.7,px+dr*len*.45,py+len)}
    g.stroke()}

  if(L<=2){var rng=H*AMP[L],hw,dS,m,isS;
    for(k=8;k<n-9;k++){
      if(!(ys[k]<ys[k-1]&&ys[k]<=ys[k+1]))continue;
      isS=true;for(j=-8;j<=8;j++)if(ys[k+j]<ys[k]){isS=false;break}
      if(!isS||(b-ys[k])<rng*.2)continue;
      m=k+1;while(m<n-2&&m<k+70&&ys[m+1]>=ys[m])m++;
      var px=xs[k],py=ys[k],sx=xs[m],dp=Math.min(H*.45,b+H*.05-py)*(.55+.3*Hh(px/4,110)),fy=py+dp,
          fx=px+(sx-px)*.28+(Hh(px/4,111)-.5)*10,kx=px+(fx-px)*.5+(Hh(px/4,112)-.5)*14,ky=py+dp*.5,
          sn=sm(0,.25,(b-py)/rng-.5),axe=(ys[m]-py)/Math.max(1,sx-px)>.6;
      var pg=g.createLinearGradient(0,py,0,fy);pg.addColorStop(0,rgba(col,[.22,.26,.3][L]*(1-.5*sn)));pg.addColorStop(1,rgba(col,0));
      g.beginPath();g.moveTo(px,py);for(j=k;j<=m;j++)g.lineTo(xs[j],ys[j]);g.lineTo(sx,fy);g.lineTo(fx,fy);g.lineTo(kx,ky);g.closePath();
      g.globalAlpha=1;g.fillStyle=pg;g.fill();
      g.strokeStyle=col;g.beginPath();
      if(axe){g.lineWidth=1.2;g.globalAlpha=.3}else{g.lineWidth=.7;g.globalAlpha=.24;g.setLineDash([14,5,6,7])}
      for(j=0;j<(m-k)*.8;j++){var u2=Hh(px/4+j,113),j0=k+1+Math.floor(u2*(m-k-1)),x0=xs[j0],y0=ys[j0]+3,r2=Hh(px/4+j,115),
          ex=lerp(fx,sx,u2)+(Hh(px/4+j,114)-.5)*10,ln=(fy-y0)*(axe?.22+.4*r2:.35+.55*r2);
        g.moveTo(x0,y0);
        if(axe){g.lineTo(x0+ln*.18,y0+ln*.5);g.lineTo(x0+ln*.1,y0+ln)}
        else g.bezierCurveTo(x0+7,y0+ln*.33,x0-7,y0+ln*.66,x0+(ex-x0)*.2,y0+ln)}
      g.stroke();g.setLineDash([]);
      if(sn>.02){dS=(b-py)*.3*sn;hw=Math.min(14,8+Math.round(dS/6));
        if(k-hw>=0&&k+hw<n){g.beginPath();for(j=k-hw;j<=k+hw;j++)j>k-hw?g.lineTo(xs[j],ys[j]):g.moveTo(xs[j],ys[j]);
          for(j=k+hw;j>=k-hw;j--)g.lineTo(xs[j],ys[j]+dS*(.5+.9*Hh(xs[j]/4,117))*(1-Math.abs(j-k)/(hw+2)));
          g.closePath();g.globalAlpha=.88;g.fillStyle=paper;g.fill();
          g.globalAlpha=.07;g.fillStyle=TINT[1];g.fill();
          g.globalAlpha=.22;g.lineWidth=.7;g.stroke()}}}}
  if(L===2)for(e=Math.floor((i*CW-M)/1300);e<=Math.floor((i*CW+CW+M)/1300);e++)if(Hh(e,200)<.35){
    var fx=e*1300+Hh(e,201)*800,fy=ridge(2,fx)+14,fl=Math.min(U*.16,(b-fy)*.6+20),k2;
    g.strokeStyle=paper;
    for(k2=0;k2<3;k2++){g.globalAlpha=.8-.2*k2;g.lineWidth=2.6-k2*.7;g.beginPath();g.moveTo(fx+k2*2,fy);g.bezierCurveTo(fx+k2*2+3,fy+fl*.4,fx+k2*2-2,fy+fl*.7,fx+k2*2+1,fy+fl);g.stroke()}
    var mg2=g.createRadialGradient(fx,fy+fl,0,fx,fy+fl,H*.04);mg2.addColorStop(0,rgba(paper,.85));mg2.addColorStop(1,rgba(paper,0));
    g.globalAlpha=1;g.fillStyle=mg2;g.fillRect(fx-H*.04,fy+fl-H*.04,H*.08,H*.08);
    g.strokeStyle=col;g.lineWidth=.9;g.globalAlpha=.3;g.beginPath();g.moveTo(fx-5,fy);g.lineTo(fx-6,fy+fl*.9);g.moveTo(fx+9,fy);g.lineTo(fx+10,fy+fl*.8);g.stroke()}

  if(L<=4){g.fillStyle=col;for(k=0;k<n;k+=2)if(Hh(xs[k]/4,101)<.55&&!(L===4&&lake(xs[k])>.3)){
    var d0=sh[k]*H*DM*Hh(xs[k]/4,102);g.globalAlpha=.1+.25*Hh(xs[k]/4,103);g.beginPath();
    g.arc(xs[k]+Hh(xs[k],104)*4,ys[k]+4+d0,.5+Hh(xs[k]/4,105)*.9,0,6.3);g.fill()}}

  if(L<=3){g.save();poly(g,xs,ys);g.clip();
    var hz=g.createLinearGradient(0,b-H*AMP[L]*.8,0,b+H*.08);
    hz.addColorStop(0,rgba(paper,0));hz.addColorStop(1,rgba(paper,[.95,.85,.7,.5][L]));
    g.globalAlpha=1;g.fillStyle=hz;g.fillRect(xs[0],0,CW+2*M+8,H);g.restore()}

  g.strokeStyle=col;g.lineWidth=4;g.globalAlpha=.05;g.beginPath();for(k=0;k<n;k++)k?g.lineTo(xs[k],ys[k]):g.moveTo(xs[k],ys[k]);g.stroke();
  rim(g,xs,ys,L);
  if(L>=2)pen(g,xs,ys,LW[L]*.8,ALPHA[L]*.55,L);

  if(L===4){var c0=Math.floor((i*CW-M)/30),c1=Math.floor((i*CW+CW+M)/30),wy0=.7*H,k3,cc,lw;
    var wg=g.createLinearGradient(0,wy0,0,wy0+H*.16);wg.addColorStop(0,rgba(TINT[1],.06));wg.addColorStop(.5,rgba(TINT[2],.16));wg.addColorStop(1,rgba(TINT[4],.26));
    var sg=g.createLinearGradient(0,wy0,0,wy0+H*.05);sg.addColorStop(0,rgba(TINT[4],.28));sg.addColorStop(1,rgba(TINT[4],0));
    var wtp=[],wbt=[],run=-1,wet;
    for(k=0;k<n;k++){wtp.push(waterTop(xs[k]));wbt.push(waterBot(xs[k]))}
    for(k=0;k<=n;k++){wet=k<n&&wbt[k]>wtp[k]+1.5;
      if(wet&&run<0)run=k;
      if(!wet&&run>=0){
        g.beginPath();g.moveTo(xs[run],wtp[run]);for(j=run;j<k;j++)g.lineTo(xs[j],wtp[j]);for(j=k-1;j>=run;j--)g.lineTo(xs[j],wbt[j]);g.closePath();
        g.globalAlpha=1;g.fillStyle=paper;g.fill();g.fillStyle=wg;g.fill();
        g.save();g.clip();g.fillStyle=sg;g.fillRect(xs[run],wy0,xs[k-1]-xs[run]+1,H*.05);g.restore();
        g.strokeStyle=TINT[4];g.lineWidth=1.1;g.globalAlpha=.28;g.beginPath();
        for(j=run;j<k;j++)j>run?g.lineTo(xs[j],wbt[j]):g.moveTo(xs[j],wbt[j]);g.stroke();
        g.lineWidth=3;g.globalAlpha=.06;g.stroke();
        run=-1}}
    for(var r=0;r<26;r++){var yy=wy0+6+r*(3.6+r*.6);if(yy>H)break;
      g.lineWidth=1+r*.07;g.strokeStyle=col;g.globalAlpha=.1+.14*r/26;g.beginPath();
      for(cc=c0;cc<=c1;cc++)if(Hh(cc,300+r)<.7&&inW(cc*30,yy)){var a0=cc*30+Hh(cc,330+r)*14,wl=10+Hh(cc,360+r)*(16+r*1.6);
        g.moveTo(a0,yy+1.6);g.quadraticCurveTo(a0+wl/2,yy+1.6+(Hh(cc,390+r)-.5)*2,a0+wl,yy+1.6)}
      g.stroke();
      g.lineWidth=1.6+r*.1;g.strokeStyle=paper;g.globalAlpha=.55;g.beginPath();
      for(cc=c0;cc<=c1;cc++)if(Hh(cc,400+r)<.5&&inW(cc*30,yy)){var a1=cc*30+Hh(cc,410+r)*16,gl=6+Hh(cc,420+r)*(10+r);g.moveTo(a1,yy);g.lineTo(a1+gl,yy)}
      g.stroke()}
    for(e=Math.floor((i*CW-M)/26);e<=Math.floor((i*CW+CW+M)/26);e++){var nx=e*26+Hh(e,436)*20,nb=waterBot(nx);
      if(nb>waterTop(nx)+8&&Hh(e,437)<.45)reeds(g,nx,nb,e)}
    for(e=Math.floor((i*CW-M)/22);e<=Math.floor((i*CW+CW+M)/22);e++){var rx2=e*22+Hh(e,430)*18,lr=lake(rx2);
      if(lr>.12&&lr<.62&&Hh(e,431)<.7){var ry2=ridge(4,rx2)+3,nbl=3+Math.floor(Hh(e,432)*4);
        for(k3=0;k3<nbl;k3++){var rh=U*(.025+.03*Hh(e+k3,433)),rl=(Hh(e+k3,434)-.5)*rh*.5;
          g.strokeStyle=TINT[5];g.lineWidth=1;g.globalAlpha=.55;g.beginPath();g.moveTo(rx2+k3*2.5,ry2);g.quadraticCurveTo(rx2+k3*2.5+rl*.3,ry2-rh*.6,rx2+k3*2.5+rl,ry2-rh);g.stroke();
          if(Hh(e+k3,435)<.5){g.fillStyle=TINT[5];g.globalAlpha=.75;g.beginPath();g.ellipse(rx2+k3*2.5+rl*.9,ry2-rh*.85,1.3,rh*.12,0,0,6.3);g.fill()}}}}
    for(e=Math.floor((i*CW-M)/700);e<=Math.floor((i*CW+CW+M)/700);e++){var bx2=e*700+Hh(e,230)*400;
      if(lake(bx2)>.75&&lake(bx2-60)>.6&&lake(bx2+60)>.6&&Hh(e,231)<.6&&.7*H+H*(.05+.06*Hh(e,232))<waterBot(bx2)-U*.025){var by2=.7*H+H*(.05+.06*Hh(e,232)),bs=U*(.016+.008*Hh(e,233));
        g.fillStyle=TINT[5];g.globalAlpha=.18;g.beginPath();g.ellipse(bx2,by2+bs*.5,bs*1.6,bs*.18,0,0,6.3);g.fill();
        g.globalAlpha=.85;g.beginPath();g.moveTo(bx2-bs,by2-bs*.1);g.quadraticCurveTo(bx2,by2+bs*.45,bx2+bs*1.1,by2-bs*.15);g.lineTo(bx2+bs*.7,by2-bs*.12);g.lineTo(bx2-bs*.7,by2-bs*.1);g.closePath();g.fill();
        g.lineWidth=1;g.strokeStyle=TINT[5];g.beginPath();g.moveTo(bx2,by2-bs*.1);g.lineTo(bx2,by2-bs*1.9);g.stroke();
        g.fillStyle=TINT[1];g.globalAlpha=.4;g.beginPath();g.moveTo(bx2+bs*.08,by2-bs*1.85);g.lineTo(bx2+bs*.08,by2-bs*.25);g.lineTo(bx2+bs*.95,by2-bs*.3);g.closePath();g.fill();g.globalAlpha=.5;g.stroke()}}
    for(e=Math.floor((i*CW-M)/70);e<=Math.floor((i*CW+CW+M)/70);e++){var vx=e*70+Hh(e,86)*50,lq=lake(vx);
      if(lq>.2&&lq<.7&&Hh(e,87)<.5)rock(g,vx,ridge(4,vx)+2,H*(.008+.012*Hh(e,88)))}}

  if(L===3||L===4){var th2=[];
    for(k=0;k<n;k++){var fm=fcov(L,xs[k])*(.5+.5*sm(.35,.55,vn(xs[k]/(520*S),60+L)))*(L===4?1-sm(.1,.2,lake(xs[k])):1);
      th2.push((L===3?10:18)*fm*(.45+.9*Hh(xs[k]/4,118)))}
    g.beginPath();g.moveTo(xs[0],ys[0]);for(k=0;k<n;k++)g.lineTo(xs[k],ys[k]-th2[k]);for(k=n-1;k>=0;k--)g.lineTo(xs[k],ys[k]+2);g.closePath();
    g.globalAlpha=L===3?.3:.36;g.fillStyle=TINT[Math.min(5,L+1)];g.fill()}
  if(L>=4){var ffl=[];for(k=0;k<n;k++)ffl.push(L===4&&lake(xs[k])>.15?0:fcov(L,xs[k]));
    g.beginPath();g.moveTo(xs[0],ys[0]);for(k=0;k<n;k++)g.lineTo(xs[k],ys[k]);for(k=n-1;k>=0;k--)g.lineTo(xs[k],ys[k]+H*(L===4?.05:.07)*ffl[k]);g.closePath();
    g.globalAlpha=.12;g.fillStyle=TINT[5];g.fill()}
  var tc=[0,0,0,22,34,72][L];
  if(tc){
    // Three passes at staggered offsets give loose Poisson-disk feel
    // Pass 0 = primary large trees, passes 1&2 = smaller secondary fill
    for(var ps=0;ps<3;ps++){
      var off0=ps*tc/3+Hh(ps*31+L,L+44)*tc*.12; // slight jitter on offset per pass
      var t0c=Math.floor((i*CW-M-off0)/tc),t1c=Math.floor((i*CW+CW+M-off0)/tc);
      for(var q2=t0c;q2<=t1c;q2++){
        var hq=q2+ps*977,tx=q2*tc+off0+Hh(hq,L+45)*tc*.85; // jitter within slot
        var fc=fcov(L,tx),ck=sm(.35,.55,vn(tx/(520*S),60+L)),alp=sm(.6,.8,altN(dAt(L,tx)));
        var p0=[0,0,0,.55,.36,.15][L];
        // probability: primary pass uses full density; secondary passes scale with forest coverage
        var p=ps===0?p0*(.14*ck*(1-alp)+fc*(.7+.3*ck)):p0*(ps===1?.65:.42)*sm(.5,.85,fc)*(L===5?.5:1);
        // Tohaku principle: thin out trees when too close to each other (approximate exclusion radius)
        var nearTree=Hh(q2*3+ps,L+46)<.28&&ps>0; // ~28% chance secondary is suppressed near primary
        if(nearTree)p*=.35;
        if(Hh(hq,L+40)<p&&!(L===4&&lake(tx)>.15)){
          var h=([0,0,0,12,24,U*.13][L]+[0,0,0,12,26,U*.17][L]*Hh(hq,L+60))*(1+.25*fc)*(ps?.72:1);
          var ty=ridge(L,tx)+2,kind=fkind(L,tx,Hh(hq,L+80),Hh(hq,L+95));
          if(L===4&&kind===4)kind=1;
          // ground shadow ellipse
          g.fillStyle=TINT[5];g.globalAlpha=.14;
          g.beginPath();g.ellipse(tx+h*.1,ty,h*.28,Math.max(1,h*.03),0,0,6.3);g.fill();
          // dispatch tree type
          if(kind===0)pine(g,tx,ty,h,L);
          else if(kind===7)pine(g,tx,ty,h*1.15,L,1);
          else if(kind===1)(ps?shrub:oak)(g,tx,ty,h,L,false);
          else if(kind===2)birch(g,tx,ty,h,L);
          else if(kind===3)birch(g,tx,ty,h,L);
          else if(kind===4)gnarl(g,tx,ty,h*1.1,L);
          else if(kind===6)bamboo(g,tx,ty,h*1.3,L);
          else oak(g,tx,ty,h,L,true);
          // undergrowth blob under larger trees
          if(L>=4&&Hh(hq,L+90)<.35+.4*fc)
            blob(g,tx+(Hh(hq,L+91)-.5)*h*.6,ty-h*.02,h*.07,TINT[Math.min(5,L+1)],.28);
        }
      }
    }
  }  if(L===3)for(e=Math.floor((i*CW-M)/1100);e<=Math.floor((i*CW+CW+M)/1100);e++)if(Hh(e,210)<.3){
    var px2=e*1100+Hh(e,211)*700,py2=ridge(3,px2)+2,ps=U*.05;
    var tiers=3+Math.floor(Hh(e,212)*2); // 3 or 4 tiers
    var totalH=ps*(1.5+.4*tiers);
    var t2,w2,yb,tw,th2,ex,ey,k2,sg;

    // --- stone base platform ---
    var bw=ps*.82,bh=ps*.14;
    // platform shadow
    g.fillStyle=TINT[5];g.globalAlpha=.15;
    g.beginPath();g.ellipse(px2+ps*.08,py2+2,bw*.7,bh*.35,0,0,6.3);g.fill();
    // platform body — two-step base
    g.fillStyle=TINT[4];g.globalAlpha=.72;
    g.fillRect(px2-bw*.5,py2-bh,bw,bh);
    g.fillRect(px2-bw*.38,py2-bh*2,bw*.76,bh);
    // platform top edge line
    g.strokeStyle=TINT[5];g.lineWidth=.8;g.globalAlpha=.55;
    g.beginPath();g.moveTo(px2-bw*.5,py2-bh);g.lineTo(px2+bw*.5,py2-bh);g.stroke();
    g.beginPath();g.moveTo(px2-bw*.38,py2-bh*2);g.lineTo(px2+bw*.38,py2-bh*2);g.stroke();
    // platform right shadow face
    g.fillStyle=TINT[5];g.globalAlpha=.22;
    g.fillRect(px2+bw*.3,py2-bh*2,bw*.2,bh*2);

    // --- tiers (bottom to top) ---
    // tbase = ground level where first tier body bottom sits
    var tbase=py2-bh*2;
    // pre-compute cumulative Y so each tier stacks on top of the previous one
    var tierBottoms=[tbase];
    for(t2=1;t2<tiers;t2++){
      var tfPrev=( t2-1)/(tiers-1);
      var thPrev=ps*(.22-.04*tfPrev);
      var ehPrev=ps*.07;
      tierBottoms.push(tierBottoms[t2-1]-thPrev-ehPrev*1.6);
    }
    for(t2=0;t2<tiers;t2++){
      var tf=t2/(tiers-1);
      tw=ps*(.68-.26*tf);
      th2=ps*(.22-.04*tf);
      var ew=tw*(.34+.08*tf);
      var eh=ps*.07;
      yb=tierBottoms[t2];          // bottom Y of this tier body — properly stacked

      // body fill — paper with slight ink wash shadow on right
      g.globalAlpha=.95;g.fillStyle=paper;
      g.fillRect(px2-tw*.5,yb-th2,tw,th2);
      // right face shadow
      var bsg=g.createLinearGradient(px2-tw*.5,0,px2+tw*.5,0);
      bsg.addColorStop(0,'rgba(0,0,0,0)');bsg.addColorStop(1,'rgba(0,0,0,.16)');
      g.globalAlpha=1;g.fillStyle=bsg;g.fillRect(px2-tw*.5,yb-th2,tw,th2);
      // thin horizontal panel divider lines on body
      g.strokeStyle=TINT[4];g.lineWidth=.5;g.globalAlpha=.28;
      g.beginPath();g.moveTo(px2-tw*.46,yb-th2*.5);g.lineTo(px2+tw*.46,yb-th2*.5);g.stroke();
      // body outline
      g.strokeStyle=TINT[5];g.lineWidth=.7;g.globalAlpha=.5;
      g.strokeRect(px2-tw*.5,yb-th2,tw,th2);

      // small window opening on front face
      if(th2>ps*.15){
        var wsx=px2-tw*.08,wsy=yb-th2*.72,wsw=tw*.18,wsh=th2*.38;
        g.fillStyle=TINT[5];g.globalAlpha=.55;g.fillRect(wsx,wsy,wsw,wsh);
        g.fillStyle=paper;g.globalAlpha=.4;g.fillRect(wsx+wsw*.15,wsy+wsh*.1,wsw*.7,wsh*.8);
        // emit lamp from window at night
        lamp(wsx+wsw*.5,wsy+wsh*.5,wsw*.7,wsh*.7);
      }

      // eave: curved upswept roof cap
      ex=px2-tw*.5-ew; ey=yb-th2-eh;
      // eave fill
      g.fillStyle=TINT[5];g.globalAlpha=.88;
      g.beginPath();
      g.moveTo(ex,ey+eh);                             // left corner
      g.quadraticCurveTo(ex+ew*.45,ey-eh*.4,px2,ey-eh*.6);   // left curve to peak
      g.quadraticCurveTo(px2+ew*.45+tw*.5,ey-eh*.4,px2+tw*.5+ew,ey+eh); // peak to right
      g.lineTo(px2+tw*.5+ew,ey+eh*1.6);
      g.lineTo(ex,ey+eh*1.6);
      g.closePath();g.fill();
      // lit top of eave
      g.fillStyle=TINT[2];g.globalAlpha=.2;
      g.beginPath();
      g.moveTo(ex,ey+eh*.3);
      g.quadraticCurveTo(px2,ey-eh*.9,px2+tw*.5+ew,ey+eh*.3);
      g.lineTo(px2+tw*.5+ew,ey+eh*.7);
      g.quadraticCurveTo(px2,ey-eh*.5,ex,ey+eh*.7);
      g.closePath();g.fill();
      // eave underside shadow
      g.fillStyle=TINT[5];g.globalAlpha=.18;
      g.fillRect(px2-tw*.5,yb-th2,tw,eh*.9);
      // eave outline
      g.strokeStyle=TINT[5];g.lineWidth=Math.max(.6,ps*.016);g.globalAlpha=.65;
      g.beginPath();
      g.moveTo(ex,ey+eh);
      g.quadraticCurveTo(px2-tw*.25,ey-eh*.5,px2,ey-eh*.6);
      g.quadraticCurveTo(px2+tw*.25+ew*.5,ey-eh*.5,px2+tw*.5+ew,ey+eh);
      g.stroke();
      // eave tip dots — small ink dots at corners simulate tile ends
      g.fillStyle=TINT[5];g.globalAlpha=.7;
      g.beginPath();g.arc(ex+1,ey+eh,Math.max(.8,ps*.018),0,6.3);g.fill();
      g.beginPath();g.arc(px2+tw*.5+ew-1,ey+eh,Math.max(.8,ps*.018),0,6.3);g.fill();
      // hanging wind-bell dot under each corner
      if(ps>6){
        g.strokeStyle=TINT[5];g.lineWidth=.5;g.globalAlpha=.4;
        g.beginPath();g.moveTo(ex+1,ey+eh*1.6);g.lineTo(ex+1,ey+eh*2.2);g.stroke();
        g.beginPath();g.moveTo(px2+tw*.5+ew-1,ey+eh*1.6);g.lineTo(px2+tw*.5+ew-1,ey+eh*2.2);g.stroke();
        g.fillStyle=TINT[5];g.globalAlpha=.55;
        g.beginPath();g.arc(ex+1,ey+eh*2.2,Math.max(.6,ps*.012),0,6.3);g.fill();
        g.beginPath();g.arc(px2+tw*.5+ew-1,ey+eh*2.2,Math.max(.6,ps*.012),0,6.3);g.fill();
      }

      tbase=yb-th2; // (unused — stacking via tierBottoms[])
    }

    // --- finial (sorin spire) ---
    // sits on top of the last tier body top, which is tierBottoms[tiers-1] - th_last
    var lastTh=ps*(.22-.04*(tiers-1)/(tiers-1));
    var finX=px2,finY=tierBottoms[tiers-1]-lastTh;
    var finH=ps*(.55+.15*Hh(e,213));
    // spire shaft
    g.strokeStyle=TINT[5];g.lineWidth=Math.max(.9,ps*.022);g.globalAlpha=.85;
    g.beginPath();g.moveTo(finX,finY);g.lineTo(finX,finY-finH);g.stroke();
    // ring discs on spire — 4 rings diminishing upward
    for(k2=0;k2<4;k2++){
      var ry=finY-finH*(.25+k2*.18),rr=ps*(.045-.008*k2);
      g.fillStyle=TINT[5];g.globalAlpha=.8;
      g.beginPath();g.ellipse(finX,ry,rr,rr*.35,0,0,6.3);g.fill();
      g.strokeStyle=TINT[5];g.lineWidth=.5;g.globalAlpha=.5;g.stroke();
    }
    // jewel top
    g.fillStyle=TINT[5];g.globalAlpha=.9;
    g.beginPath();g.arc(finX,finY-finH,Math.max(1,ps*.032),0,6.3);g.fill();
    g.fillStyle=paper;g.globalAlpha=.4;
    g.beginPath();g.arc(finX-ps*.01,finY-finH-ps*.01,Math.max(.5,ps*.014),0,6.3);g.fill();

    // emit chimney/incense smoke from base
    if(Hh(e,214)<.55)emit(px2+ps*.05,tbase,ps*1.2);
  }
  if(L===3||L===4)village(g,L,i*CW-M-480,i*CW+CW+M+480);

  if(L===5){g.save();poly(g,xs,ys);g.clip();
    for(e=Math.floor((i*CW-M-160)/200);e<=Math.floor((i*CW+CW+M+160)/200);e++)if(Hh(e,850)<.7){
      var fvx=e*200+Hh(e,851)*160,fvy=ridge(5,fvx)+H*(.01+.05*Hh(e,852)),fvr=H*(.06+.08*Hh(e,853)),
          fvg=g.createRadialGradient(fvx,fvy,0,fvx,fvy,fvr);
      fvg.addColorStop(0,rgba(TINT[5],.1+.1*Hh(e,854)));fvg.addColorStop(1,rgba(TINT[5],0));
      g.globalAlpha=1;g.fillStyle=fvg;g.fillRect(fvx-fvr,fvy-fvr,fvr*2,fvr*2)}
    g.beginPath();g.moveTo(xs[0],H+5);
    for(k=0;k<n;k++)g.lineTo(xs[k],H*(.955+.03*vn(xs[k]/110,860)));
    g.lineTo(xs[n-1],H+5);g.closePath();g.globalAlpha=.2;g.fillStyle=TINT[5];g.fill();
    g.restore()}
  if(L>=4){var tcw=L===5?9:12,hs=Math.max(.6,U/800);
    if(L===5){g.strokeStyle=col;for(e=Math.floor((i*CW-M)/26);e<=Math.floor((i*CW+CW+M)/26);e++)if(Hh(e,90)<.6){
      var x0=e*26+Hh(e,91)*20,y0=ridge(5,x0)+8+Hh(e,92)*H*.06;g.globalAlpha=.05+.07*Hh(e,93);g.lineWidth=2+Hh(e,94)*2;
      g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+20+Hh(e,95)*50,y0+(Hh(e,96)-.5)*2);g.stroke()}
      for(var u=Math.floor((i*CW-M)/220);u<=Math.floor((i*CW+CW+M)/220);u++)if(Hh(u,81)<.55){
        var rx=u*220+Hh(u,82)*160,rs=U*(.028+.05*Hh(u,83)),ry=ridge(5,rx)+H*.02+Hh(u,84)*H*.03;
        rock(g,rx,ry,rs);rock(g,rx+rs*1.5,ry+2,rs*.38);if(Hh(u,85)<.6)rock(g,rx-rs*1.2,ry+3,rs*.25)}}
    if(L===4){g.strokeStyle=col;for(e=Math.floor((i*CW-M)/30);e<=Math.floor((i*CW+CW+M)/30);e++)if(Hh(e,98)<.5){
      var dx0=e*30+Hh(e,99)*24,dy0=ridge(4,dx0)+10+Hh(e,100)*H*.12;if(inW(dx0,dy0))continue;
      g.globalAlpha=.05+.06*Hh(e,101);g.lineWidth=2+Hh(e,102)*2.5;g.beginPath();g.moveTo(dx0,dy0);g.lineTo(dx0+24+Hh(e,103)*60,dy0+(Hh(e,104)-.5)*2);g.stroke()}}
    for(e=Math.floor((i*CW-M)/tcw);e<=Math.floor((i*CW+CW+M)/tcw);e++){var gx=e*tcw+Hh(e,77)*tcw;
      if(Hh(e,78)<(L===5?.62:.45)*(1-.55*fcov(L,gx))){var r0=ridge(L,gx),gy=r0+(L===5?6+Hh(e,79)*H*.06:4+Hh(e,79)*H*.12);
        if(L===4&&inW(gx,gy))continue;
        tuft(g,gx,gy,L===5?(12+26*Hh(e,80))*hs*(.7+.6*((gy-r0)/(H*.06))):(5+6*Hh(e,80))*(.8+1.3*(gy-r0)/(H*.12)),L)}}}
  if(L===5){var sc5=Math.max(.7,U/800);
    for(e=Math.floor((i*CW-M)/44);e<=Math.floor((i*CW+CW+M)/44);e++){
      var pxx=e*44+Hh(e,870)*40,wv=wetN(dAt(5,pxx));
      if(Hh(e,871)<.3){var pyy=ridge(5,pxx)+10+Hh(e,872)*H*.06,pn=2+Math.floor(Hh(e,873)*3),pj;
        for(pj=0;pj<pn;pj++){var ps2=(1.2+2.6*Hh(e*4+pj,874))*sc5,pjx=pxx+pj*ps2*2.2,pjy=pyy+Hh(e*4+pj,875)*3;
          g.fillStyle=TINT[5];g.globalAlpha=.28;g.beginPath();g.ellipse(pjx,pjy,ps2*1.3,ps2*.8,0,0,6.3);g.fill();
          g.fillStyle=paper;g.globalAlpha=.35;g.beginPath();g.ellipse(pjx-ps2*.3,pjy-ps2*.2,ps2*.5,ps2*.25,0,0,6.3);g.fill()}}
      if(wv>.3&&wv<.75&&Hh(e,876)<.22){
        var fh=(9+14*Hh(e,877))*sc5,fx=pxx+14,fy=ridge(5,fx)+8+Hh(e,878)*H*.05,fxx=fx+(Hh(e,879)-.5)*8,fyy=fy-fh,fr=fh*.22,fp;
        g.strokeStyle=TINT[5];g.globalAlpha=.4;g.lineWidth=.9;g.beginPath();g.moveTo(fx,fy);g.quadraticCurveTo(fx+(Hh(e,879)-.5)*6,fy-fh*.6,fxx,fyy);g.stroke();
        g.fillStyle=TINT[4];g.globalAlpha=.55;for(fp=0;fp<5;fp++)leaf(g,fxx,fyy,fr,fp*1.2566-1.5708,fr*.5);
        g.fillStyle=paper;g.globalAlpha=.9;g.beginPath();g.arc(fxx,fyy,fr*.16,0,6.3);g.fill()}}}
  if(L===5)for(e=Math.floor((i*CW-M)/1700);e<=Math.floor((i*CW+CW+M)/1700);e++)if(Hh(e,240)<.4){
    var hx=e*1700+Hh(e,241)*900;oak(g,hx,ridge(5,hx)+8,U*.46,5,Hh(e,242)<.2)}
  c.em=EM;c.lt=LT;
  return c;
}
function prune(L,i0,i1){
  for(var kk in cache[L])if(kk<i0-3||kk>i1+3){var c=cache[L][kk];delete cache[L][kk];
    if(pool[L].length<2)pool[L].push(c);else{c.width=0;c.height=0}}}
function releaseAll(){for(var L=0;L<6;L++){for(var k in cache[L]){cache[L][k].width=0;cache[L][k].height=0}cache[L]={};
  pool[L].forEach(function(c){c.width=0;c.height=0});pool[L]=[]}
  if(rbuf){rbuf.width=0;rbuf.height=0}rbuf=rctx=null}
function emergency(){releaseAll();qual=Math.max(.5,qual*.8);seen={}}
var bf=0;
function get(L,i,force){
  var c=cache[L][i];if(c)return c;
  if(!force||(bf>0&&performance.now()>forceEnd))return null;bf++;
  var t1=performance.now();c=build(L,i);bcost[L]=bcost[L]*.7+(performance.now()-t1)*.3;if(c)cache[L][i]=c;return c}
function ahead(){
  var fw=vel>=0?1:-1,order=[[1,fw],[1,-fw],[2,fw],[2,-fw],[3,fw],[3,-fw]],o,L,i,c,t1;
  for(o=0;o<order.length;o++)for(L=5;L>=0;L--){
    i=order[o][1]>0?i1s[L]+order[o][0]:i0s[L]-order[o][0];
    if(i<-1||cache[L][i])continue;
    if(performance.now()-frameStart+bcost[L]>14)continue;
    t1=performance.now();c=build(L,i);bcost[L]=bcost[L]*.7+(performance.now()-t1)*.3;if(c)cache[L][i]=c}}

var rbuf=null,rctx=null;
function reflect(){
  var y0=.7*H,o4=offs[4],stp=6,xs=[],wt=[],wb=[],x,i,k,n,run,RHh,bw,bh,nS,dy,al,dx,x0,x1,wRun,ok=false,sp=reduce?0:tNow;
  for(x=-stp;x<=W+stp;x+=stp){xs.push(x);wt.push(waterTop(x+o4));wb.push(waterBot(x+o4))}
  n=xs.length;
  for(i=0;i<n;i++)if(wb[i]>wt[i]+3){ok=true;break}
  if(!ok)return;
  RHh=Math.floor(Math.min(H*.2,y0));bw=Math.round(W*dpr);bh=Math.round(RHh*dpr);
  if(!rbuf){rbuf=document.createElement("canvas");rctx=rbuf.getContext("2d")}
  if(rbuf.width!==bw||rbuf.height!==bh){rbuf.width=bw;rbuf.height=bh}
  rctx.setTransform(1,0,0,1,0,0);rctx.clearRect(0,0,bw,bh);
  rctx.drawImage(cv,0,Math.round((y0-RHh)*dpr),bw,bh,0,0,bw,bh);
  nS=Math.floor(RHh/3);i=0;
  while(i<n){
    if(!(wb[i]>wt[i]+3)){i++;continue}
    run=i;while(i<n&&wb[i]>wt[i]+3)i++;
    if(i-run<3)continue;
    x0=Math.max(0,xs[run]);x1=Math.min(W,xs[i-1]);wRun=x1-x0;if(wRun<8)continue;
    ctx.save();ctx.beginPath();ctx.moveTo(xs[run],wt[run]);for(k=run;k<i;k++)ctx.lineTo(xs[k],wt[k]);for(k=i-1;k>=run;k--)ctx.lineTo(xs[k],wb[k]);ctx.closePath();ctx.clip();
    for(k=0;k<nS;k++){dy=y0+k*3;if(dy>H)break;
      al=.42*Math.pow(1-k/nS,1.4)*(1-.5*ov)*(1-.7*rainA);if(al<.01)continue;
      dx=Math.sin(k*.85+sp*.0017)*(.5+k*.07);
      ctx.globalAlpha=al;ctx.drawImage(rbuf,x0*dpr,(RHh-(k+1)*3)*dpr,wRun*dpr,3*dpr,x0+dx,dy,wRun,3)}
    ctx.restore()}
  ctx.globalAlpha=1}
function windX(){return (vn(tNow/25000+seed*.1,181)-.35)*1.6*(1+rainA*.5)}
function smokeLive(list,off){
  var wnd=windX(),e,j,a,x,y,s,r,rg,al;
  for(e=0;e<list.length;e++){s=list[e].s;
    for(j=0;j<5;j++){a=((tNow*.00028+j/5+list[e].h)%1+1)%1;
      x=list[e].x-off+wnd*a*s*1.8+Math.sin(a*6+j+list[e].h*9)*s*.05;y=list[e].y-a*s*1.7;r=s*(.08+.15*a);
      al=.2*sm(0,.12,a)*(1-a)*(1-ov*.5);if(al<.01)continue;
      rg=ctx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,rgba(TINT[1],al));rg.addColorStop(1,rgba(TINT[1],0));
      ctx.globalAlpha=1;ctx.fillStyle=rg;ctx.fillRect(x-r,y-r,r*2,r*2)}}}
function lights(lit){
  if(nightG<.04||!lit.length)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  var i,k,e,on,x,y,fl,r,rg;
  for(i=0;i<lit.length;i++)for(k=0;k<lit[i].a.length;k++){e=lit[i].a[k];on=sm(e.o,e.o+.25,nightG);if(on<.02)continue;
    x=e.x-lit[i].off;y=e.y;if(x<-40||x>W+40)continue;
    fl=.88+.12*Math.sin(tNow*.004+e.o*40);r=Math.max(e.w,e.h)*2.8;
    rg=ctx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,rgba(paper,.5*on*fl));rg.addColorStop(1,rgba(paper,0));
    ctx.globalAlpha=1;ctx.fillStyle=rg;ctx.fillRect(x-r,y-r,r*2,r*2);
    ctx.globalAlpha=Math.min(1,on*fl);ctx.fillStyle=paper;ctx.fillRect(x-e.w/2,y-e.h/2,e.w,e.h)}
  ctx.globalAlpha=1}
function glitter(off,now){
  if(gA<.02)return;
  var tq=reduce?0:Math.floor(now/450);
  ctx.save();ctx.lineCap="round";ctx.strokeStyle=gMoon?ink:paper;
  for(var r=0;r<22;r++){var y=.7*H+6+r*(3.6+r*.6);if(y>H*.96)break;
    var sp=U*(.05+.014*r),dl=6+r*1.6;ctx.lineWidth=1.4+r*.1;ctx.globalAlpha=Math.min(1,gA*(.55+.02*r));ctx.beginPath();
    for(var x=gX-sp;x<gX+sp;x+=11){var c=Math.floor((x+off)/11),d=Math.abs(x-gX)/sp;
      if(y>waterTop(x+off)+2&&y<waterBot(x+off)-2&&Hh(c*7+r,260+(tq+r)%5)<.8*(1-d)){ctx.moveTo(x,y+Hh(c,261));ctx.lineTo(x+dl,y+Hh(c,261))}}
    ctx.stroke()}
  ctx.restore()}
function waterTop(x){return Math.max(ridge(4,x),.7*H)}
function waterBot(x){var v=lakeV(x);if(v<.36)return -1;
  return .7*H+H*.15*Math.sqrt(sm(.36,.66,v))*(.85+.3*vn(x/90,57))}
function inW(x,y){return y>waterTop(x)+2&&y<waterBot(x)-2}
function mod(a,b){return ((a%b)+b)%b}
var PB=[{n:12,L:2,k:1,y0:.5,y1:.8,r0:.8,r1:1.3,w:.010,a:.45},{n:14,L:4,k:1,y0:.58,y1:.9,r0:1.2,r1:2,w:.018,a:.6},{n:8,L:5,k:1.5,y0:.72,y1:.98,r0:2.4,r1:4.2,w:.04,a:.7}];
function wet(wx,y){return (inW(wx-16,y)+inW(wx,y)+inW(wx+16,y))/3}
function parts(b){
  if(reduce||kEff<.03)return;
  var P=PB[b],leafy=sm(.55,.75,vn(ds*.5/3000+31,175)),span=W*1.3,off=offs[P.L]*P.k,
      o4=offs[4],gain=Math.min(1,kEff*1.4),i,x,y,r,fl,leaf,rg,wx,fo,wf,al,w,per,ph,on;
  for(i=0;i<P.n;i++){
    x=mod(Hh(i,500+b)*span-off+tNow*P.w*(.4+Hh(i,520+b)),span)-W*.15;
    wx=x+o4;fo=fcov(4,wx);
    r=P.r0+(P.r1-P.r0)*Hh(i,540+b);
    leaf=b>0&&Hh(i,530+b)<leafy*.8;
    if(leaf){
      w=sm(.45,.65,fo)*dayG*(1-ov*.5)*gain;if(w<.02)continue;
      y=mod(Hh(i,510+b)*H*.5+tNow*.02*(.6+Hh(i,521+b))*(b+1)*.45,H*.5)+H*.45;
      ctx.save();ctx.translate(x,y);ctx.rotate(tNow*.001*(Hh(i,531)-.5)*4+i);ctx.globalAlpha=.55*w;ctx.fillStyle=TINT[3];
      ctx.beginPath();ctx.ellipse(0,0,r*1.7,r*.75,0,0,6.3);ctx.fill();ctx.restore();continue}
    y=(P.y0+(P.y1-P.y0)*Hh(i,510+b))*H+Math.sin(tNow*.0008*(.5+Hh(i,521+b))+i*1.7)*(5+6*b);
    wf=wet(wx,y);

    al=P.a*dayG*(1-ov*.8)*(1-wf)*(1-.6*fo)*gain;
    if(al>.02){ctx.fillStyle=ink;ctx.globalAlpha=al*.18;ctx.beginPath();ctx.arc(x+.8,y+.8,r,0,6.3);ctx.fill();
      if(b===2){rg=ctx.createRadialGradient(x,y,0,x,y,r*2.2);rg.addColorStop(0,rgba(paper,.9));rg.addColorStop(1,rgba(paper,0));
        ctx.globalAlpha=al;ctx.fillStyle=rg;ctx.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4)}
      else{ctx.globalAlpha=al;ctx.fillStyle=paper;ctx.beginPath();ctx.arc(x,y,r,0,6.3);ctx.fill()}}

    per=1.4+2.6*Hh(i,561+b);ph=((tNow/1000/per+Hh(i,562+b))%1+1)%1;
    fl=.1+.9*sm(0,.1,ph)*(1-sm(.1,.45,ph));
    on=sm(Hh(i,563+b)*.7,Hh(i,563+b)*.7+.25,nightG);
    al=on*Math.max(wf*.4,fo*.9)*fl*gain*(b===0?.6:1);
    if(al>.02){rg=ctx.createRadialGradient(x,y,0,x,y,r*3);rg.addColorStop(0,rgba(ink,Math.min(1,al)));rg.addColorStop(1,rgba(ink,0));
      ctx.globalAlpha=1;ctx.fillStyle=rg;ctx.fillRect(x-r*3,y-r*3,r*6,r*6);
      ctx.globalAlpha=Math.min(1,al*1.3);ctx.fillStyle=ink;ctx.beginPath();ctx.arc(x,y,r*.55,0,6.3);ctx.fill()}
  }
}
function bez(x0,y0,cx,cy,x1,y1,t){var u=1-t;return[u*u*x0+2*u*t*cx+t*t*x1,u*u*y0+2*u*t*cy+t*t*y1]}
function leaf(g,x,y,len,ang,w){
  var ca=Math.cos(ang),sa=Math.sin(ang),mx=x+ca*len*.5,my=y+sa*len*.5,nx=-sa*w,ny=ca*w;
  g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx+nx,my+ny,x+ca*len,y+sa*len);g.quadraticCurveTo(mx-nx,my-ny,x,y);g.fill()}
function limb(g,x0,y0,cx,cy,x1,y1,w0,w1){
  var n=14,k,t,u,p,dx,dy,l,w,A=[],B=[];
  for(k=0;k<=n;k++){t=k/n;u=1-t;p=bez(x0,y0,cx,cy,x1,y1,t);
    dx=2*u*(cx-x0)+2*t*(x1-cx);dy=2*u*(cy-y0)+2*t*(y1-cy);l=Math.sqrt(dx*dx+dy*dy)||1;w=(w0+(w1-w0)*t)*.5;
    A.push([p[0]-dy/l*w,p[1]+dx/l*w]);B.push([p[0]+dy/l*w,p[1]-dx/l*w])}
  g.beginPath();g.moveTo(A[0][0],A[0][1]);
  for(k=1;k<=n;k++)g.lineTo(A[k][0],A[k][1]);
  for(k=n;k>=0;k--)g.lineTo(B[k][0],B[k][1]);
  g.closePath();g.fill()}
function fgBlade(x,len,lean,wh,wc,a){
  ctx.globalAlpha=.1*a;blade(ctx,x,H+6,len,lean,wh);ctx.globalAlpha=a;blade(ctx,x,H+6,len,lean,wc)}
function fgStem(x,y0,hh,lean,wh,wc,a){
  ctx.lineWidth=wh;ctx.globalAlpha=.1*a;ctx.beginPath();ctx.moveTo(x,y0);ctx.quadraticCurveTo(x+lean*.1,y0-hh*.6,x+lean,y0-hh);ctx.stroke();
  ctx.lineWidth=wc;ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(x,y0);ctx.quadraticCurveTo(x+lean*.1,y0-hh*.6,x+lean,y0-hh);ctx.stroke()}
function fgKind(c,w){var r=Hh(c,580);
  if(w>.6)return r<.5?2:3;
  if(w<.4)return r<.5?1:0;
  return r<.3?0:r<.55?4:r<.8?1:3}
function fgClump(c,bx,kind,k){
  var y0=H+6,j,s,nb,len,hh,lean,x,u,ang,t,p,q,ta,tx,ty,pl,ex,ey,cxx,cyy,
      sw=function(j,l){return Math.sin(tNow*.0014+j+c)*l*.05};
  ctx.fillStyle=TINT[5];ctx.strokeStyle=TINT[5];ctx.lineCap="round";
  if(kind===0){
    nb=7+Math.floor(Hh(c,562)*6);
    for(j=0;j<nb;j++){len=U*(.12+.2*Hh(c*20+j,563));lean=(j-nb/2)*len*.1+sw(j,len);x=bx+(j-nb/2)*U*.018+(Hh(c*20+j,564)-.5)*14;
      fgBlade(x,len,lean,U*.02,U*.007,(.4+.35*Hh(c*20+j,565))*k)}
  }else if(kind===1){
    nb=9+Math.floor(Hh(c,590)*6);
    for(j=0;j<nb;j++){len=U*(.15+.2*Hh(c*20+j,591));lean=(j-nb/2)*len*.22+sw(j,len);x=bx+(j-nb/2)*U*.012;
      fgBlade(x,len,lean,U*.012,U*.0042,(.35+.3*Hh(c*20+j,592))*k)}
    nb=4+Math.floor(Hh(c,593)*3);
    for(j=0;j<nb;j++){hh=U*(.3+.18*Hh(c*20+j,594));lean=(j-nb/2)*hh*.16+sw(j+2,hh)*1.4;x=bx+(j-nb/2)*U*.02;
      fgStem(x,y0,hh,lean,U*.01,U*.0028,.55*k);
      tx=x+lean;ty=y0-hh;ang=-1.5708+lean/hh*.9;
      ctx.globalAlpha=.16*k;leaf(ctx,tx,ty,U*.1,ang,U*.032);
      ctx.globalAlpha=.5*k;leaf(ctx,tx,ty,U*.075,ang,U*.014);
      ctx.lineWidth=U*.0012;ctx.globalAlpha=.4*k;ctx.beginPath();
      for(s=-3;s<=3;s++){ctx.moveTo(tx+Math.cos(ang)*U*.03,ty+Math.sin(ang)*U*.03);ctx.lineTo(tx+Math.cos(ang+s*.14)*U*.085,ty+Math.sin(ang+s*.14)*U*.085)}
      ctx.stroke()}
  }else if(kind===2){
    nb=6+Math.floor(Hh(c,595)*4);
    for(j=0;j<nb;j++){hh=U*(.22+.28*Hh(c*20+j,596));lean=(Hh(c*20+j,597)-.5)*hh*.18+sw(j,hh)*.7;x=bx+(j-nb/2)*U*.016;
      fgStem(x,y0,hh,lean,U*.012,U*.0032,(.45+.3*Hh(c*20+j,598))*k);
      if(Hh(c*20+j,599)<.55){ctx.globalAlpha=.8*k;ctx.beginPath();ctx.ellipse(x+lean*.88,y0-hh*.88,U*.0058,U*.026,lean/hh*.5,0,6.3);ctx.fill();
        ctx.lineWidth=U*.0018;ctx.beginPath();ctx.moveTo(x+lean*.97,y0-hh*.97);ctx.lineTo(x+lean,y0-hh);ctx.stroke()}}
    for(j=0;j<3;j++){len=U*(.2+.15*Hh(c*20+j,600));lean=(j-1)*len*.35+sw(j,len);fgBlade(bx+(j-1)*U*.02,len,lean,U*.016,U*.0055,.5*k)}
  }else if(kind===3){
    nb=6+Math.floor(Hh(c,601)*4);
    for(j=0;j<nb;j++){u=(j+.5)/nb-.5;len=U*(.14+.12*Hh(c*20+j,602));ang=-1.5708+u*2.3;
      ex=bx+Math.cos(ang)*len+sw(j,len);ey=y0+Math.sin(ang)*len+len*.35*Math.abs(u);
      cxx=bx+Math.cos(ang)*len*.55;cyy=y0+Math.sin(ang)*len*.7-len*.12;
      ctx.lineWidth=U*.011;ctx.globalAlpha=.08*k;ctx.beginPath();ctx.moveTo(bx,y0);ctx.quadraticCurveTo(cxx,cyy,ex,ey);ctx.stroke();
      ctx.lineWidth=U*.0026;ctx.globalAlpha=.55*k;ctx.beginPath();ctx.moveTo(bx,y0);ctx.quadraticCurveTo(cxx,cyy,ex,ey);ctx.stroke();
      for(t=.22;t<1;t+=.09){p=bez(bx,y0,cxx,cyy,ex,ey,t);q=bez(bx,y0,cxx,cyy,ex,ey,t+.03);ta=Math.atan2(q[1]-p[1],q[0]-p[0]);
        pl=U*.034*(1.05-t*.6);ctx.globalAlpha=(.3+.3*Hh(c*30+j*7,603+(t*10|0)))*k;
        leaf(ctx,p[0],p[1],pl,ta-1,pl*.3);leaf(ctx,p[0],p[1],pl,ta+1,pl*.3)}}
  }else{
    nb=5+Math.floor(Hh(c,604)*4);
    for(j=0;j<nb;j++){hh=U*(.12+.16*Hh(c*20+j,605));lean=(Hh(c*20+j,606)-.5)*hh*.5+sw(j,hh);x=bx+(j-nb/2)*U*.022;
      fgStem(x,y0,hh,lean,U*.009,U*.0025,.5*k);
      p=bez(x,y0,x+lean*.1,y0-hh*.6,x+lean,y0-hh,.38);
      ctx.globalAlpha=.42*k;leaf(ctx,p[0],p[1],U*.05,j%2?-2.4:-.75,U*.012);
      tx=x+lean;ty=y0-hh;pl=U*(.014+.008*Hh(c*20+j,607));
      if(Hh(c*20+j,608)<.75){ctx.globalAlpha=.55*k;for(s=0;s<5;s++)leaf(ctx,tx,ty,pl,s*1.2566-1.5708,pl*.5);
        ctx.fillStyle=paper;ctx.globalAlpha=.9*k;ctx.beginPath();ctx.arc(tx,ty,pl*.16,0,6.3);ctx.fill();ctx.fillStyle=TINT[5]}
      else{ctx.globalAlpha=.7*k;ctx.beginPath();ctx.ellipse(tx,ty-pl*.4,pl*.3,pl*.55,lean/hh,0,6.3);ctx.fill()}}
  }
}
function fgBranch(c,tx,k){
  var dir=Hh(c,568)<.5?-1:1,ex=tx+dir*U*(.3+.15*Hh(c,583)),ey=U*(.1+.12*Hh(c,569)),kind=Math.floor(Hh(c,582)*4),
      sw=Math.sin(tNow*.0009+c)*U*.006,cx=tx+dir*U*.12,cy=ey*.4,segs=[],nt=3+Math.floor(Hh(c,584)*2),
      j,i,t,p,q,ang,tl,tp,sg,ss,x,y,a2,sd,n2;
  ex+=sw;
  ctx.fillStyle=TINT[5];ctx.strokeStyle=TINT[5];ctx.lineCap="round";ctx.lineJoin="round";
  ctx.globalAlpha=.1*k;limb(ctx,tx,-10,cx,cy,ex,ey,U*.04,U*.012);
  ctx.globalAlpha=.6*k;limb(ctx,tx,-10,cx,cy,ex,ey,U*.02,U*.0045);
  segs.push([tx,-10,cx,cy,ex,ey]);
  for(j=0;j<nt;j++){
    t=.3+.6*(j+.2+Hh(c*9+j,585)*.6)/nt;p=bez(tx,-10,cx,cy,ex,ey,t);q=bez(tx,-10,cx,cy,ex,ey,t+.03);
    ang=Math.atan2(q[1]-p[1],q[0]-p[0])+(j%2?1:-1)*(.6+.5*Hh(c*9+j,586));
    tl=U*(.08+.1*Hh(c*9+j,587));if(Math.sin(ang)<-.2)tl*=.6;
    var tex=p[0]+Math.cos(ang)*tl,tey=p[1]+Math.sin(ang)*tl,tcx=(p[0]+tex)/2-Math.sin(ang)*tl*.14,tcy=(p[1]+tey)/2+Math.cos(ang)*tl*.14;
    ctx.globalAlpha=.55*k;limb(ctx,p[0],p[1],tcx,tcy,tex,tey,U*.009,U*.0022);
    segs.push([p[0],p[1],tcx,tcy,tex,tey]);
    if(kind===3){
      for(sd=-1;sd<=1;sd+=2){a2=ang+sd*(.5+.3*Hh(c*9+j+sd,588));n2=tl*.55;
        var fx=tex+Math.cos(a2)*n2,fy=tey+Math.sin(a2)*n2;
        ctx.globalAlpha=.5*k;limb(ctx,tex,tey,(tex+fx)/2,(tey+fy)/2,fx,fy,U*.004,U*.0013);segs.push([tex,tey,(tex+fx)/2,(tey+fy)/2,fx,fy])}}
  }
  if(kind===0){
    for(i=0;i<segs.length;i++){sg=segs[i];
      for(t=i?.3:.45;t<=1.001;t+=i?.18:.08){p=bez(sg[0],sg[1],sg[2],sg[3],sg[4],sg[5],t);q=bez(sg[0],sg[1],sg[2],sg[3],sg[4],sg[5],Math.min(1,t+.03));
        ang=Math.atan2(q[1]-p[1],q[0]-p[0]);
        for(sd=-1;sd<=1;sd+=2){a2=ang+sd*(.55+.5*Hh(i*50+(t*40|0)+sd,589))+.35;tl=U*(.034+.03*Hh(i*50+(t*40|0)+sd,590));
          ctx.fillStyle=TINT[(i+(t*10|0))%2?4:5];
          ctx.globalAlpha=.06*k;leaf(ctx,p[0],p[1],tl*1.8,a2,tl*.7);
          ctx.globalAlpha=(.4+.3*Hh(i*50+(t*40|0)+sd,591))*k;leaf(ctx,p[0],p[1],tl,a2,tl*.32)}}}
    ctx.fillStyle=TINT[5];
  }else if(kind===1){
    ctx.lineWidth=U*.0016;ctx.globalAlpha=.55*k;ctx.beginPath();
    for(i=0;i<segs.length;i++){sg=segs[i];
      for(t=i?.35:.5;t<=1.001;t+=i?.22:.1){p=bez(sg[0],sg[1],sg[2],sg[3],sg[4],sg[5],t);q=bez(sg[0],sg[1],sg[2],sg[3],sg[4],sg[5],Math.min(1,t+.03));
        ang=Math.atan2(q[1]-p[1],q[0]-p[0]);
        for(n2=-3;n2<=3;n2++){a2=ang+n2*.3+.25;tl=U*.045*(.7+.6*Hh(i*60+(t*50|0)+n2,592));ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+Math.cos(a2)*tl,p[1]+Math.sin(a2)*tl)}}}
    ctx.stroke();
  }else if(kind===2){
    sg=segs[0];
    for(j=0;j<9;j++){t=.28+.72*j/8;p=bez(sg[0],sg[1],sg[2],sg[3],sg[4],sg[5],t);
      tl=U*(.15+.2*Hh(c*11+j,593));x=p[0]+Math.sin(tNow*.0011+j+c)*U*.008+dir*U*.01;y=p[1]+tl;
      ctx.lineWidth=U*.009;ctx.globalAlpha=.05*k;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.quadraticCurveTo(p[0]+dir*U*.012,p[1]+tl*.5,x,y);ctx.stroke();
      ctx.lineWidth=U*.002;ctx.globalAlpha=.5*k;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.quadraticCurveTo(p[0]+dir*U*.012,p[1]+tl*.5,x,y);ctx.stroke();
      for(t=.15;t<1;t+=.09){q=bez(p[0],p[1],p[0]+dir*U*.012,p[1]+tl*.5,x,y,t);
        ctx.fillStyle=TINT[(j+(t*10|0))%2?4:5];ctx.globalAlpha=.45*k;
        leaf(ctx,q[0],q[1],U*.03,1.57+((t*10|0)%2?.8:-.8),U*.008)}}
    ctx.fillStyle=TINT[5];
  }
}
function frameFg(){
  if(reduce||kEff<.05)return;
  var off=offs[5]*1.7,cs=900,c0=Math.floor((off-300)/cs),c,bx,tx;
  ctx.save();
  for(c=c0;c<=c0+Math.ceil(W/cs)+1;c++){
    if(Hh(c,560)<.55){bx=c*cs+Hh(c,561)*500-off;fgClump(c,bx,fgKind(c,wetN(c*cs/(1.7*SP[5]))),kEff)}
    if(Hh(c,566)<.18){tx=c*cs+Hh(c,567)*500-off;fgBranch(c,tx,kEff)}
  }
  ctx.restore();ctx.globalAlpha=1;
}
function weather(){var d=ds*.5,r=sm(150,900,d),a=vn(d/2600+3,171)+.18*(wetN(ds)-.5),b=vn(d/2200+9,172)+.12*(wetN(ds)-.5),c=vn(d/3000+17,173)+.15*(altN(ds)-.5);
  var fogN=sm(.5,.72,a)*r,rn=sm(.64,.82,b)*r,sn=sm(.66,.84,c)*(1-rn)*r;
  rainA=rn;snowA=sn;ov=Math.max(fogN*.55,rn,sn*.8);fogA=Math.max(fogN,rn*.5,sn*.45)}
function wob(cx,cy,r,sd){ctx.beginPath();for(var t=0;t<=48;t++){var th=t/48*6.2832,rr=r*(1+(Hh(t%48+sd*7,151)-.5)*.05);ctx[t?"lineTo":"moveTo"](cx+Math.cos(th)*rr,cy+Math.sin(th)*rr)}ctx.closePath()}
function sky(a,p,dayF){
  var aa=a,night=1-dayF,i,gr=ctx.createLinearGradient(0,0,0,H*.62);a=a*(1-.85*ov);
  gr.addColorStop(0,rgba(TINT[1],.34+.3*ov));gr.addColorStop(.6,rgba(TINT[0],.1));gr.addColorStop(1,rgba(TINT[0],0));
  ctx.globalAlpha=aa*dayF;ctx.fillStyle=gr;ctx.fillRect(0,0,W,H*.62);
  if(night>.02){var so=ds*.02+seed*13,cs=64,c0=Math.floor(so/cs);ctx.fillStyle=ink;
    for(var cx=c0;cx<=c0+Math.ceil(W/cs)+1;cx++)for(var cy=0;cy<H*.5/cs;cy++){var hq=cx*31+cy;if(Hh(hq,120)<.4){
      ctx.globalAlpha=a*night*(.3+.7*(.5+.5*Math.sin(ds*.004+cx+cy*3)));ctx.beginPath();
      ctx.arc(cx*cs+Hh(hq,121)*cs-so,cy*cs+Hh(hq,122)*cs,.6+Hh(hq,123)*1.1,0,6.3);ctx.fill()}}}
  var R=Math.min(W,H)*.05,ph=p*6.2832,sE=Math.sin(ph),sX=W/2-Math.cos(ph)*W*.46,sY=H*.5-sE*H*.36,
      mE=-sE,mX=W/2+Math.cos(ph)*W*.46,mY=H*.5+sE*H*.36,bx,by,ga,B,an,q;
  var wm=(1-sm(.12,.5,sE))*dayF*(1-ov*.7);
  if(wm>.02){var dk=.5-.5*Math.cos(ph),wr=Math.round(lerp(228,214,dk)),wg2=Math.round(lerp(176,128,dk)),wb2=Math.round(lerp(120,128,dk)),
      hg2=ctx.createLinearGradient(0,H*.14,0,H*.64);
    hg2.addColorStop(0,"rgba("+wr+","+wg2+","+wb2+",0)");hg2.addColorStop(.75,"rgba("+wr+","+wg2+","+wb2+","+(.3*wm)+")");hg2.addColorStop(1,"rgba("+wr+","+wg2+","+wb2+","+(.14*wm)+")");
    ctx.globalAlpha=aa;ctx.fillStyle=hg2;ctx.fillRect(0,H*.14,W,H*.5)}
  ctx.lineCap="round";
  if(sE>-.3){bx=sX;by=sY;ga=a*sm(-.3,.05,sE);
    B=R*5;var rg=ctx.createRadialGradient(bx,by,R*.4,bx,by,B);rg.addColorStop(0,rgba(paper,.9));rg.addColorStop(1,rgba(paper,0));
    ctx.globalAlpha=ga;ctx.fillStyle=rg;ctx.fillRect(bx-B,by-B,B*2,B*2);
    B=R*2.8;var hg=ctx.createRadialGradient(bx,by,R,bx,by,B);hg.addColorStop(0,rgba(TINT[1],.2));hg.addColorStop(.5,rgba(TINT[1],.07));hg.addColorStop(1,rgba(TINT[1],0));
    ctx.fillStyle=hg;ctx.fillRect(bx-B,by-B,B*2,B*2);
    ctx.fillStyle=paper;ctx.globalAlpha=ga;wob(bx,by,R,1);ctx.fill();
    ctx.strokeStyle=TINT[2];ctx.lineWidth=1.3;ctx.globalAlpha=ga*.32;ctx.stroke();
    ctx.lineWidth=.8;ctx.globalAlpha=ga*.14;wob(bx,by,R*.82,2);ctx.stroke();
    ctx.lineWidth=1;ctx.globalAlpha=ga*.08;ctx.beginPath();
    for(q=0;q<10;q++){an=q/10*6.2832+.2+Hh(q,6)*.3;ctx.moveTo(bx+Math.cos(an)*R*1.28,by+Math.sin(an)*R*1.28);
      ctx.lineTo(bx+Math.cos(an)*R*(1.6+.9*Hh(q,5)),by+Math.sin(an)*R*(1.6+.9*Hh(q,5)))}ctx.stroke()}
  if(mE>-.3){bx=mX;by=mY;ga=a*sm(-.3,.05,mE);
    var nn=Math.floor(ds*.5/CYCLE+.08),f=.22+.7*Hh(nn,150),dx=(1-f)*2.3*R*(Hh(nn,151)<.5?1:-1);
    B=R*3.6;var mg=ctx.createRadialGradient(bx,by,R*.8,bx,by,B);mg.addColorStop(0,rgba(ink,.16));mg.addColorStop(1,rgba(ink,0));
    ctx.globalAlpha=ga;ctx.fillStyle=mg;ctx.fillRect(bx-B,by-B,B*2,B*2);
    ctx.save();wob(bx,by,R,5);ctx.clip();
    ctx.fillStyle=ink;ctx.globalAlpha=ga;ctx.fillRect(bx-R,by-R,R*2,R*2);
    for(q=0;q<7;q++)blob(ctx,bx+(Hh(q,160)-.5)*R*1.3,by+(Hh(q,161)-.5)*R*1.3,R*(.12+.2*Hh(q,162)),paper,.22+.2*Hh(q,163));
    ctx.globalAlpha=1;ctx.fillStyle=paper;ctx.beginPath();ctx.arc(bx+dx,by,R*1.02,0,6.3);ctx.fill();
    ctx.globalAlpha=ga*.12;ctx.fillStyle=ink;ctx.fill();
    ctx.restore();
    ctx.strokeStyle=ink;ctx.lineWidth=.8;ctx.globalAlpha=ga*.3;wob(bx,by,R,5);ctx.stroke()}
  if(sE>=mE){gX=sX;gMoon=false;gA=sm(.02,.25,sE)*dayF*(1-ov*.9)*aa}else{gX=mX;gMoon=true;gA=sm(.02,.25,mE)*night*.8*(1-ov*.9)*aa}
  a=aa;
  var bd,sc,cs2,off,c1,c,x,y,w,r,pf,px,py,pr,cg,bs,bo,b0,bq,gx,gy,j,qx,qy,fl2;
  for(bd=0;bd<2;bd++){
    sc=[.7,1.3][bd];cs2=[380,560][bd];
    off=[offs[0]*1.2,offs[1]*1.4][bd]+tNow*[.004,.009][bd]+seed*57+bd*911;c1=Math.floor((off-300)/cs2);
    for(c=c1;c<c1+Math.ceil(W/cs2)+3;c++)if(Hh(c,70+bd*9)<.65+.35*ov){
      x=c*cs2+Hh(c,71)*180-off;y=H*([.07,.1][bd]+[.13,.17][bd]*Hh(c,72));w=(140+Hh(c,73)*170)*sc;r=w*.2;
      ctx.globalAlpha=a*dayF*[.75,1][bd];ctx.fillStyle=rgba(TINT[1],.09);ctx.beginPath();ctx.ellipse(x+w/2,y+r*.55,w*.56,r*.4,0,0,6.3);ctx.fill();
      for(pf=0;pf<5;pf++){px=x+w*(pf/4);py=y-Math.sin(pf/4*Math.PI)*r*.7;pr=r*(.8+.5*Hh(c*7+pf,74));
        cg=ctx.createRadialGradient(px,py,0,px,py,pr);cg.addColorStop(0,rgba(paper,.95));cg.addColorStop(.6,rgba(paper,.7));cg.addColorStop(1,rgba(paper,0));
        ctx.fillStyle=cg;ctx.fillRect(px-pr,py-pr,pr*2,pr*2)}}}
  ctx.strokeStyle=TINT[5];ctx.lineWidth=1.2;ctx.lineCap="round";
  if(dayF>.05)for(bd=0;bd<2;bd++){sc=[.6,1.2][bd];bs=[900,1300][bd];
    bo=[offs[1]*2,offs[3]*1.3][bd]+tNow*[.03,.06][bd]+seed*91+bd*517;b0=Math.floor((bo-100)/bs);ctx.globalAlpha=a*.7*dayF*(1-ov)*[.7,1][bd];
    for(bq=b0;bq<b0+Math.ceil(W/bs)+2;bq++)if(Hh(bq,80+bd*3)<.5){
      gx=bq*bs+Hh(bq,81)*500-bo;gy=H*(.14+.2*Hh(bq,82));ctx.beginPath();
      for(j=0;j<3;j++){qx=gx+j*18*sc;qy=gy+j*7*sc+Math.sin(tNow*.003+j+bq)*2;fl2=Math.sin(tNow*.012+j*1.3+bq)*3*sc;
        ctx.moveTo(qx-6*sc,qy-3*sc+fl2);ctx.quadraticCurveTo(qx-3*sc,qy-6*sc,qx,qy);ctx.quadraticCurveTo(qx+3*sc,qy-6*sc,qx+6*sc,qy-3*sc+fl2)}ctx.stroke()}}
}
var UNITS=["km","mi","steps","time"],UNAME=["kilometres","miles","steps","time on foot"],unit=0;
try{var su=localStorage.getItem("nj-unit");if(su!==null&&UNITS[+su])unit=+su;else if(/^en-(US|GB|LR)\b|^my\b/i.test(navigator.language||""))unit=1}catch(e){}
function fmt(m){
  var u=UNITS[unit],k,mi,mn;
  if(u==="km"){if(m<1000)return [Math.floor(m).toLocaleString(),"M"];k=m/1000;
    return [k.toLocaleString(undefined,{minimumFractionDigits:k<100?1:0,maximumFractionDigits:k<100?1:0}),"KM"]}
  if(u==="mi"){mi=m*.000621371;if(mi<.1)return [Math.round(m*3.28084).toLocaleString(),"FT"];
    return [mi.toLocaleString(undefined,{minimumFractionDigits:mi<10?2:1,maximumFractionDigits:mi<10?2:1}),"MI"]}
  if(u==="steps")return [Math.floor(m/.75).toLocaleString(),"STEPS"];
  mn=Math.floor(m*.012);
  return [mn<60?mn+" min":Math.floor(mn/60)+" h "+(mn%60)+" m","ON FOOT"]}
function mix(a,b,t){var x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16),f=function(sh){return Math.round((x>>sh&255)*(1-t)+(y>>sh&255)*t)};return "rgb("+f(16)+","+f(8)+","+f(0)+")"}
var distEl=document.getElementById("dist"),unitEl=document.getElementById("unit"),hint=document.getElementById("hint"),root=document.documentElement,tt;
function toast(m){hint.textContent=m;hint.style.opacity=1;clearTimeout(tt);tt=setTimeout(function(){hint.style.opacity=0},2800)}

function frame(now){
  if(!walking&&!wantShot&&Math.abs(Math.max(0,scrollY)-ds)<.04&&(++fcount&1)){requestAnimationFrame(frame);return}
  frameStart=performance.now();forceEnd=frameStart+24;bf=0;
  var dt=Math.min(.05,(now-last)/1000);last=now;
  if(walking){wy+=dt*spd;scrollTo(0,wy)}else wy=scrollY;
  ensure();var tg=Math.max(0,scrollY);ds+=(tg-ds)*(reduce?1:1-Math.exp(-dt*14));if(Math.abs(tg-ds)<.04)ds=tg;budget=3;
  tNow=reduce?0:now;var dds=ds-prevDs;prevDs=ds;vel=vel*.9+dds*.1;var kt=KT[DEPTH];kEff+=(kt-kEff)*(1-Math.exp(-dt*5));if(Math.abs(kt-kEff)<.002)kEff=kt;
  for(var L0=0;L0<6;L0++)offs[L0]+=dds*PIV*Math.pow(SP[L0]/PIV,kEff);
  var p=(((.08+ds*.5/CYCLE)%1)+1)%1,dayF=sm(-.14,.24,Math.sin(p*6.2832)),night=1-dayF;
  // Lighting mode override: 0=Day, 1=Auto, 2=Night
  // Also pin p so sun/moon sit at a good sky position when locked
  if(LIGHT===0){dayF=1;night=0;p=.25}else if(LIGHT===2){dayF=0;night=1;p=.75}
  weather();dayG=dayF;nightG=night;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle=paper;ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  sky(reduce?1:Math.min(1,(now-t0)/1800),p,dayF);
  var lit=[];
  for(var L=0;L<6;L++){
    var off=offs[L],i0=Math.floor(off/CW),i1=Math.floor((off+W)/CW);i1s[L]=i1;i0s[L]=i0;
    for(var i=i0;i<=i1;i++){
      var ch=get(L,i,true);if(!ch)continue;
      var key=L+"_"+i;if(seen[key]==null)seen[key]=now<introEnd?now+L*150:-1e9;
      var t=reduce?1:Math.min(1,(now-seen[key])/1300);if(t<=0)continue;
      var q=1-Math.pow(1-t,3),sx=i*CW-off,cx0=Math.floor(sx);
      ctx.globalAlpha=1;ctx.save();ctx.beginPath();ctx.rect(cx0,0,Math.ceil(sx+(q>=1?CW:CW*q))-cx0,H);ctx.clip();
      ctx.drawImage(ch,0,0,ch.width,ch.height,sx-1,0,CW+2,H);ctx.restore();
      if(ch.em&&ch.em.length)smokeLive(ch.em,off);if(ch.lt&&ch.lt.length)lit.push({a:ch.lt,off:off});
    }
    prune(L,i0,i1);
    if(L===4){reflect();glitter(off,now)}
    if(fogA>.01&&L<5){var fy0=BASE[L]*H,fg=ctx.createLinearGradient(0,fy0-H*.22,0,fy0+H*.12);
      fg.addColorStop(0,rgba(paper,0));fg.addColorStop(.6,rgba(paper,fogA*.55));fg.addColorStop(1,rgba(paper,fogA*.2));
      ctx.globalAlpha=1;ctx.fillStyle=fg;ctx.fillRect(0,fy0-H*.22,W,H*.34)}
    if(L===2)parts(0);if(L===4)parts(1);if(L===5){parts(2);frameFg()}
  }
  ahead();
  if((++fr&1023)===0)for(var sk in seen)if(Math.abs(+sk.split("_")[1]-i1s[+sk.charAt(0)])>60)delete seen[sk];
  var pi,tm=reduce?0:now;
  if(ov>.02){ctx.globalAlpha=ov*.1;ctx.fillStyle=TINT[3];ctx.fillRect(0,0,W,H)}
  if(rainA>.02){ctx.strokeStyle=TINT[5];ctx.lineWidth=1;ctx.lineCap="round";ctx.globalAlpha=rainA*.3;ctx.beginPath();
    for(pi=0;pi<150;pi++){var ry=(Hh(pi,181)+tm*.0006*(.7+.6*Hh(pi,182)))%1,rx=(Hh(pi,180)*W+ry*H*.25)%(W+60),rz=ry*H;ctx.moveTo(rx,rz);ctx.lineTo(rx-4,rz+16)}ctx.stroke()}
  if(snowA>.02){for(pi=0;pi<130;pi++){var sy=((Hh(pi,191)+tm*.00008*(.5+Hh(pi,192)))%1)*H,sx=(Hh(pi,190)*W+Math.sin(tm*.001+pi)*14)%W,sr=1+Hh(pi,193)*1.8;
    ctx.globalAlpha=.85*snowA;ctx.fillStyle=paper;ctx.beginPath();ctx.arc(sx,sy,sr,0,6.3);ctx.fill();
    ctx.strokeStyle=TINT[3];ctx.lineWidth=.6;ctx.globalAlpha=.25*snowA;ctx.stroke()}}
  ctx.globalAlpha=1;

  if(night>.003){ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=night;
    ctx.globalCompositeOperation="difference";ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);
    ctx.globalCompositeOperation="lighten";ctx.fillStyle="#2B2B2D";ctx.fillRect(0,0,cv.width,cv.height);
    ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1}
  lights(lit);
  if(rainA>.7&&!reduce){var lt=Math.floor(now/7000),lp=(now%7000)/7000;
    if(Hh(lt,250)<.55&&lp<.06){var lf=(lp<.015||(lp>.025&&lp<.04))?1:.35*(1-lp/.06);
      ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=lf*.4*rainA;ctx.fillStyle="#EFEDE8";ctx.fillRect(0,0,cv.width,cv.height);ctx.globalAlpha=1}}
  if(wantShot){wantShot=false;cv.toBlob(save,"image/png")}
  if(Math.abs(night-lastN)>.02){lastN=night;
    root.style.setProperty("--paper",mix("#EFEDE8","#2B2B2D",night));root.style.setProperty("--ink",mix("#2B2B2D","#EFEDE8",night))}
  var fs=fmt(ds*.5);if(fs[0]+fs[1]!==lastD){lastD=fs[0]+fs[1];distEl.textContent=fs[0];unitEl.textContent=fs[1]}
  requestAnimationFrame(frame);
}
function save(b){
  flashIt();
  var name="nijimi-"+Math.floor(ds*.5)+"m.png";
  var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},4000);toast("Screenshot saved");
}
function ensure(){var h=parseFloat(spacer.style.height)||0;if(scrollY+innerHeight*4>h)spacer.style.height=(h+innerHeight*8)+"px"}
function reset(){releaseAll();seen={};introEnd=performance.now()+3500}
var probe=document.createElement("div");probe.style.cssText="position:fixed;left:0;top:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";document.body.appendChild(probe);
function vh(){return probe.clientHeight||innerHeight}
function resize(){dpr=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=vh();S=Math.max(.6,Math.min(1,W/1000));U=Math.min(H,W*1.1);cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";reset()}
var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(innerWidth!==W||Math.abs(vh()-H)>120)resize()},200)});
addEventListener("scroll",function(){if(scrollY>40)hint.style.opacity=0},{passive:true});
var walk=document.getElementById("walk");
walk.onclick=function(){setWalk(!walking)};
function stopWalk(e){if(!walking)return;if(e.target.closest&&e.target.closest(".menu"))return;
  if(e.type==="keydown"&&(e.target.tagName==="BUTTON"||["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].indexOf(e.key)<0))return;
  setWalk(false)}
["wheel","touchmove","keydown"].forEach(function(ev){addEventListener(ev,stopWalk,{passive:true})});
document.getElementById("seed").onclick=function(){seed=1+Math.floor(Math.random()*9000);reset()};
document.getElementById("shot").onclick=function(){wantShot=true};
var body=document.body,menuB=document.getElementById("menu"),tray=document.getElementById("tray"),walkLb=document.getElementById("walkLb"),flashEl=document.getElementById("flash"),idleT;
function setWalk(v){walking=v;walk.setAttribute("aria-pressed",v);walkLb.textContent=v?"Pause":"Auto-walk";wy=scrollY}
function wake(){body.classList.remove("dim");clearTimeout(idleT);idleT=setTimeout(function(){if(!tray.classList.contains("open"))body.classList.add("dim")},3200)}
function setOpen(o){tray.classList.toggle("open",o);menuB.setAttribute("aria-expanded",o);menuB.setAttribute("aria-label",o?"Close controls":"Open controls");wake()}
function photo(on){body.classList.toggle("photo",on);setOpen(false);if(on)toast("Controls hidden. Tap the top-right corner or press H to bring them back")}
function flashIt(){flashEl.classList.add("on");setTimeout(function(){flashEl.classList.remove("on")},90)}
menuB.onclick=function(){setOpen(!tray.classList.contains("open"))};
document.getElementById("hide").onclick=function(){photo(true)};
document.getElementById("revive").onclick=function(){photo(false)};
["seed","shot"].forEach(function(id){document.getElementById(id).addEventListener("click",function(){setOpen(false)})});
document.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){spd=+b.dataset.s;
  document.querySelectorAll("[data-s]").forEach(function(o){o.setAttribute("aria-pressed",o===b)})}});
addEventListener("pointerdown",function(e){if(!e.target.closest(".menu"))setOpen(false)});
["pointerdown","pointermove","keydown","focusin"].forEach(function(ev){addEventListener(ev,wake,{passive:true})});
addEventListener("keydown",function(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==="Escape"){if(body.classList.contains("photo"))photo(false);else if(tray.classList.contains("open")){setOpen(false);menuB.focus()}return}
  var k=e.key.length===1?e.key.toLowerCase():"";
  if(k==="w")setWalk(!walking);else if(k==="n")document.getElementById("seed").click();else if(k==="s")wantShot=true;else if(k==="h")photo(!body.classList.contains("photo"));else if(k==="u")document.getElementById("odo").click();else if(k==="d"){setDepth((DEPTH+1)%3)}else if(k==="l"){setLight((LIGHT+1)%3)}});
document.getElementById("odo").onclick=function(){unit=(unit+1)%UNITS.length;try{localStorage.setItem("nj-unit",unit)}catch(e){}lastD="";toast("Showing "+UNAME[unit])};
var DNAME=["Flat","Gentle","Full depth"];
function setDepth(d,quiet){DEPTH=d;try{localStorage.setItem("nj-depth",d)}catch(e){}
  document.querySelectorAll("[data-d]").forEach(function(o){o.setAttribute("aria-pressed",+o.dataset.d===d)});if(!quiet)toast("Depth: "+DNAME[d])}
document.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){setDepth(+b.dataset.d)}});
var sdp=null;try{sdp=localStorage.getItem("nj-depth")}catch(e){}
setDepth(reduce?0:(sdp!==null&&KT[+sdp]!==undefined?+sdp:2),true);
var LIGHT=1; // 0=Day 1=Auto 2=Night
var LNAME=["Day","Auto cycle","Night"];
function setLight(l,quiet){LIGHT=l;try{localStorage.setItem("nj-light",l)}catch(e){}
  document.querySelectorAll("[data-l]").forEach(function(o){o.setAttribute("aria-pressed",+o.dataset.l===l)});
  // when switching to Day/Night, force a CSS vars update immediately
  if(l===0){root.style.setProperty("--paper","#EFEDE8");root.style.setProperty("--ink","#2B2B2D")}
  if(l===2){root.style.setProperty("--paper","#2B2B2D");root.style.setProperty("--ink","#EFEDE8")}
  if(!quiet)toast("Lighting: "+LNAME[l])}
document.querySelectorAll("[data-l]").forEach(function(b){b.onclick=function(){setLight(+b.dataset.l)}});
var slt=null;try{slt=localStorage.getItem("nj-light")}catch(e){}
setLight(slt!==null&&+slt>=0&&+slt<=2?+slt:1,true);
wake();
resize();if(matchMedia("(pointer:coarse)").matches)hint.textContent="Swipe up to keep drawing";requestAnimationFrame(frame);
})();
