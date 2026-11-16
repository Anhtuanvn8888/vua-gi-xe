/* Vua Giữ Xe — self-contained lightweight WebGL 3D renderer (no CDN/dependency). */
export class Parking3D {
  constructor(canvas){
    this.canvas=canvas;
    this.gl=canvas.getContext('webgl',{antialias:true,alpha:true,powerPreference:'high-performance'}) || canvas.getContext('experimental-webgl');
    this.visible=true;this.animations=new Map();this.time=0;
    this.eye=[10,13,13];this.target=[0,0,0];
    this.view=lookAt(this.eye,this.target,[0,1,0]);this.proj=ortho(-7.5,7.5,-7.7,7.7,.1,60);this.pv=mul(this.proj,this.view);
    if(!this.gl){this.visible=false;this.ctx=canvas.getContext('2d');return;}
    let gl=this.gl;
    const vert=`attribute vec3 aPosition;attribute vec3 aColor; uniform mat4 uPV; varying vec3 vColor; void main(){gl_Position=uPV*vec4(aPosition,1.);vColor=aColor;}`;
    const frag=`precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}`;
    function compile(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    const pr=gl.createProgram();gl.attachShader(pr,compile(gl.VERTEX_SHADER,vert));gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));this.program=pr;
    this.ap=gl.getAttribLocation(pr,'aPosition');this.ac=gl.getAttribLocation(pr,'aColor');this.up=gl.getUniformLocation(pr,'uPV');this.buffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.07,.14,.19,0);
    this.builder=new Geometry();
  }
  setSize(w,h){let canvas=this.canvas;const dpr=Math.min(window.devicePixelRatio||1,1.65),bw=Math.max(2,Math.round(w*dpr)),bh=Math.max(2,Math.round(h*dpr));if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}if(!this.visible)return;this.gl.viewport(0,0,bw,bh);
   const ratio=w/h,base=5.70;let horiz=base*Math.max(.90,ratio),vert=base*Math.max(.92,1/ratio); // enough room for narrow screens
   this.proj=ortho(-horiz,horiz,-vert,vert,.1,60);this.pv=mul(this.proj,this.view);
  }
  pos(r,c){return [(c-2)*1.27,0,(r-1.5)*1.28];}
  screen(r,c){let p=this.pos(r,c);return this.project([p[0],.2,p[2]]);}
  project(p){let v=transform(this.pv,[...p,1]);return {x:(v[0]/v[3]+1)*this.canvas.clientWidth/2,y:(1-v[1]/v[3])*this.canvas.clientHeight/2};}
  render(game,delta){if(!this.visible){this.render2D(game,delta);return}this.time+=delta;const b=this.builder;b.reset();const sec=this.time;
    b.box(0,-.30,0,8.65,.35,7.1,'#344f55'); b.box(0,-.14,0,8.1,.05,6.67,game.rain?'#4b6973':game.theme==='wedding'?'#6b6872':game.theme==='festival'?'#65676a':'#4d6266');
    // decorative outside scenery
    for(let i=-3;i<4;i++){b.box(i*1.25,-.18,-3.47,1.16,.10,.13,'#ecc68b');b.box(i*1.25,-.18,3.47,1.16,.10,.13,'#ecc68b')}
    // left street, booth, planter fencing
    b.box(-4.55,-.07,-.3,1.12,.07,7.5,'#9c8c74');b.box(4.6,-.07,-.2,1.25,.07,7.4,'#7d8884');
    b.box(-4.6,.18,-2.6,.82,.42,.72,'#edb45f');b.box(-4.6,.45,-2.6,1.08,.14,.99,'#bf594c');b.box(-4.6,.78,-2.6,.82,.56,.72,'#e4d5b1');b.box(-4.58,.85,-2.235,.63,.39,.05,'#55bed2');b.box(-4.6,1.20,-2.6,1.22,.14,1.12,'#b64b3e');
    b.box(4.7,.22,.66,.32,.54,.32,'#f8cd54');b.box(4.7,.5,.66,.27,.10,.26,'#2d3944');b.box(4.65,.55,.66,.03,.11,.15,'#55ffb3');b.box(5.02,.45,.65,.52,.065,.075,'#f4e8e0');
    for(let c=0;c<5;c++)for(let r=0;r<4;r++){
      let [x,y,z]=this.pos(r,c),dark=(r+c)%2===0;
      b.box(x,-.105,z,1.19,.05,1.18,game.puddles?.includes(r*5+c)?'#386e81':dark?'#496467':'#546c6e');
      // lines visible between vehicles
      b.box(x-.58,-.072,z,.035,.012,1.11,'#dadace');b.box(x+.58,-.072,z,.035,.012,1.11,'#dadace');
      b.box(x,-.069,z-.57,1.17,.012,.025,'#d4ddd3');
      b.box(x,-.037,z-.58,.46,.015,.05,'#e4be63');
      if(game.puddles?.includes(r*5+c))b.box(x,-.03,z,.88,.01,.5,'#3b95b0');
    }
    // Trees and flower pots (low-poly, instanced in same draw call)
    for(let z of [-3.8,-1.85,1.5,3.65]){this.tree(b,-5.55,z);this.tree(b,5.7,z)}
    for(let i=-3;i<=3;i++){b.box(i*1.05,.04,-3.56,.94,.28,.23,'#e6b680');b.sphere(i*1.05,.27,-3.56,.42,'#329b69',7,4);b.sphere(i*1.05+.15,.5,-3.56,.17,'#ff6a9b',6,3)}
    // exit marks
    let exit=this.pos(2,4);b.box(4.25,-.035,exit[2],.72,.015,.65,'#33c896');
    for(let k=0;k<4;k++){let xx=4.00+k*.25;b.box(xx,-.018,exit[2],.14,.006,.085,'#baffba')}
    // fence and posts leave right gate open
    for(let x=-3.8;x<=3.9;x+=.90){for(let z of [-3.38,3.39]){b.box(x,.40,z,.045,.82,.045,'#354d54')}}
    for(let z=-3.15;z<=3.15;z+=.80){b.box(-4.02,.4,z,.05,.82,.05,'#374e58');if(Math.abs(z-exit[2])>.9)b.box(4.02,.4,z,.05,.82,.05,'#374e58')}
    for(let z of [-3.38,3.39]){b.box(0,.70,z,7.97,.05,.06,'#334c55');b.box(0,.30,z,7.97,.036,.042,'#46636b')}
    this.themeProps(b,game.theme,sec);this.guard(b,-5.25,1.65,sec);
    // vehicles; animation by smooth interpolated cell
    for(let i=0;i<20;i++){
      const v=game.board[i];if(!v)continue;
      let [x,y,z]=this.pos(Math.floor(i/5),i%5);let a=this.animations.get(v.id);
      if(a){a.t+=delta*3.8;let t=Math.min(1,a.t),e=t*t*(3-2*t);x=a.from[0]+(x-a.from[0])*e;z=a.from[2]+(z-a.from[2])*e;y=.13*Math.sin(Math.PI*e);if(t===1)this.animations.delete(v.id)}
      let isTarget=v.id===game.currentTarget,selected=game.selected===i;
      if(isTarget||selected){let pulse=1+.03*Math.sin(sec*4);b.box(x,-.024,z,1.04*pulse,.013,1.01*pulse,isTarget?'#ffe177':'#61f5da');b.box(x,-.019,z,.88,.008,.89,isTarget?'#76542f':'#2d7070');}
      this.vehicle(b,x,y,z,v,sec);
      if(v.locked)b.box(x,.64,z,.35,.14,.38,'#dd586c');
    }
    // selected accessible destination tiles green: display only if selected vehicle
    if(game.selected!==null&&game.selected!==undefined&&game.board[game.selected]){
      const r=Math.floor(game.selected/5),c=game.selected%5;
      for(const [dr,dc] of [[0,1],[1,0],[-1,0],[0,-1]]){
       let nr=r+dr,nc=c+dc;if(nr<0||nr>=4||nc<0||nc>=5||game.board[nr*5+nc])continue;
       const [x,,z]=this.pos(nr,nc);b.box(x,-.021,z,1.03,.018,1.03,'#55e9bc');b.box(x,-.010,z,.83,.009,.83,'#386a66');
      }
    }
    const data=b.finish(); const gl=this.gl;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(this.ap);gl.enableVertexAttribArray(this.ac);gl.vertexAttribPointer(this.ap,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(this.ac,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(this.up,false,this.pv);gl.drawArrays(gl.TRIANGLES,0,data.length/6);
  }
  animateMove(id,index){this.animations.set(id,{from:this.pos(Math.floor(index/5),index%5),t:0})}
  vehicle(b,x,y,z,v,t){ const col=v.color||'#e65e56'; const car=v.kind==='car'||v.kind==='ambulance';const bike=v.kind==='bike';
    b.box(x,-.025+y,z,.92,.019,.76,'#3a4544');
    if(car){
      let light=v.kind==='ambulance';b.box(x,.34+y,z,1.05,.38,.74,col);
      b.box(x-.08,.61+y,z,.63,.36,.66,light?'#fafbf1':'#c9dde1');
      b.box(x-.21,.65+y,z,.15,.23,.69,'#77aabd');b.box(x+.21,.65+y,z,.16,.24,.68,'#81aebe');
      b.box(x+.52,.35+y,z,.09,.21,.54,light?'#f3f5e7':'#dbe4d9');b.box(x-.54,.37+y,z,.05,.19,.58,'#b64c4c');
      for(const dx of [-.38,.39])for(const dz of [-.34,.34]){
         b.cylinder(x+dx,.18+y,z+dz,.15,.16,'#242d33',10,'z');b.cylinder(x+dx,.18+y,z+dz+(dz>0?.09:-.09),.088,.018,'#cdd9d7',10,'z')
      }
      if(light){b.box(x,.85+y,z,.25,.14,.32,'#ee3945');b.box(x+.55,.37+y,z,.035,.27,.30,'#e94a5a');}
    }else if(bike){
      for(let dx of [-.33,.34]){b.cylinder(x+dx,.22+y,z,.19,.105,'#252f34',10,'z');b.cylinder(x+dx,.22+y,z+.10,.128,.02,'#e0e5dd',10,'z')}
      b.box(x,.42+y,z,.59,.10,.08,col);b.box(x-.05,.49+y,z,.09,.22,.1,'#d4dddd');b.box(x+.14,.47+y,z,.10,.29,.08,col);
      b.box(x+.34,.78+y,z,.07,.09,.45,'#2c3a42');b.box(x-.26,.63+y,z,.30,.07,.24,'#dce4db');
    }else{
      for(let dx of [-.34,.37]){b.cylinder(x+dx,.24+y,z,.21,.125,'#222b35',12,'z');b.cylinder(x+dx,.24+y,z+.125,.12,.018,'#e2e2da',10,'z')}
      b.box(x,.38+y,z,.65,.25,.32,col);b.box(x-.05,.51+y,z,.32,.25,.37,col);
      b.box(x-.19,.66+y,z,.35,.09,.33,'#29323b');b.box(x+.24,.58+y,z,.22,.25,.34,col);
      b.box(x+.36,.78+y,z,.08,.07,.53,'#303e46');b.box(x+.34,.65+y,z,.13,.2,.26,'#b5d8e0');
      b.box(x+.39,.66+y,z,.14,.06,.22,'#fff8c6');b.box(x-.36,.42+y,z,.15,.10,.26,'#d3474e');
    }
  }
  guard(b,x,z,t){
   // guard avatar, boots + green uniform + floating head + badge
   b.box(x,.18,z-.15,.17,.38,.22,'#263638');b.box(x,.18,z+.15,.17,.38,.22,'#263638');
   b.box(x,.75,z,.62,.73,.39,'#18745d');b.box(x,1.23,z,.27,.42,.30,'#efd0a5');b.sphere(x,1.55,z,.34,'#efc49a',9,5);
   b.box(x,1.92,z,.75,.17,.6,'#0b654a');b.box(x+.18,1.40,z+.31,.22,.085,.09,'#5c3a32');b.box(x-.17,1.41,z+.31,.22,.09,.09,'#5c3a32');
   b.box(x,1.04,z+.22,.28,.12,.036,'#f8d273');b.box(x-.42,.84,z,.17,.56,.20,'#218262');b.box(x+.42,.84,z,.17,.56,.20,'#218262');
  }
  themeProps(b,theme,sec){
   if(theme==='school'){for(let x of [-2.4,2.4])b.box(x,1.28,-4.15,.56,2.56,.54,'#eac27c');b.box(0,2.53,-4.15,5.3,.58,.42,'#3a668e');b.box(0,2.10,-4.19,4.8,.20,.40,'#ffd99b');}
   if(theme==='market'||theme==='rain'){for(let x of [-2.8,-1,1.0,2.8]){b.box(x,.38,-4.05,1.24,.75,.8,'#be8e5c');b.box(x,1.01,-4.05,1.45,.18,1.0,Math.floor(x)%2?'#e9c5af':'#d15457');b.box(x,.72,-3.58,.96,.21,.34,'#6cb66b')}}
   if(theme==='wedding'){for(let x of [-2.15,2.15])b.box(x,1.21,-4.10,.23,2.4,.28,'#e7d8bc');b.box(0,2.3,-4.1,4.65,.23,.30,'#df808f');for(let x=-2;x<2.4;x+=.58){b.sphere(x,2.41,-4.1,.27,Math.floor(x*8)%2?'#f6d5c1':'#e86687',7,4)} }
   if(theme==='hospital'){b.box(0,1.04,-4.22,4.9,2.20,.65,'#e3edef');b.box(0,2.15,-3.79,.76,.23,.07,'#e44258');b.box(0,2.15,-3.78,.20,.75,.07,'#e44258');for(let x of [-1.5,1.5])b.box(x,1.25,-3.84,.78,.84,.05,'#82adca')}
   if(theme==='stadium'||theme==='office'){for(let x of [-3,-1.2,.6,2.4]){b.box(x,.40,-4.1,1.60,.70,.80,'#5d6d9a');b.box(x,.84,-4.1,1.60,.12,.80,'#e2c478')}}
   if(theme==='fair'||theme==='festival'||theme==='final'){for(let x of [-3.0,-1.5,0,1.5,3.0]){b.box(x,1.30,-4.03,.09,2.6,.11,'#d0b76a');b.sphere(x,2.35+Math.sin(sec*1.3+x)*.03,-4.03,.35,Math.round(x*7)%2?'#e85361':'#f4cd57',8,5)} }
   if(theme==='final'){b.box(0,2.65,-4.02,.8,.70,.75,'#f7d64e');b.cylinder(0,3.1,-4.02,.55,.22,'#ffde6d',12);b.box(0,2.29,-4.02,1.14,.25,.9,'#654e88')}
  }
  tree(b,x,z){b.box(x,.62,z,.17,1.24,.18,'#82624e');b.sphere(x,1.65,z,.61,'#26996a',8,5);b.sphere(x+.30,1.92,z+.09,.38,'#30b47d',7,4);b.sphere(x-.18,1.95,z-.17,.39,'#34a96b',7,4)}
  render2D(game,delta){
   if(!this.ctx)return;this.time+=delta;let ctx=this.ctx,w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;
   let d=this.canvas.width/w;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
   let grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#8cbdc2');grad.addColorStop(.65,'#c1d9bf');grad.addColorStop(1,'#547b90');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
   let project=(x,y,z)=>this.project([x,y,z]),box=(x,y,z,ww,hh,dd,c)=>{
      let l=x-ww/2,r=x+ww/2,bo=y-hh/2,top=y+hh/2,z1=z-dd/2,z2=z+dd/2;
      let polygon=(points,col)=>{ctx.beginPath();points.forEach((pt,i)=>{let p=project(...pt);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)});ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.lineWidth=.35;ctx.strokeStyle='#172c3840';ctx.stroke()};
      polygon([[l,bo,z2],[r,bo,z2],[r,top,z2],[l,top,z2]],dark(c,.80));
      polygon([[r,bo,z2],[r,bo,z1],[r,top,z1],[r,top,z2]],c);
      polygon([[l,top,z2],[r,top,z2],[r,top,z1],[l,top,z1]],light(c,1.17));
    };
   let color=game.rain?'#465963':game.theme==='wedding'?'#63626f':game.theme==='festival'?'#74696a':'#53706e';box(0,-.23,0,8.75,.35,7.12,color);box(0,-.08,0,8.05,.07,6.61,'#687e79');
   for(let r=0;r<4;r++)for(let c=0;c<5;c++){let [x,,z]=this.pos(r,c),wet=game.puddles?.includes(r*5+c);box(x,-.045,z,1.22,.045,1.20,wet?'#509cad':(r+c)%2===0?'#617978':'#687c79');box(x-.59,-.014,z,.023,.012,1.05,'#e6e9dc');box(x+.59,-.014,z,.023,.012,1.05,'#e6e9dc');box(x,-.014,z-.59,1.14,.012,.023,'#d7e5d9')}
   for(let z of [-3.65,-2.1,1.9,3.62]){let p=project(-4.8,0,z),p2=project(4.8,0,z);for(let t of [p,p2]){ctx.fillStyle='#1a6b50';ctx.beginPath();ctx.arc(t.x,t.y-15,Math.max(5,w/45),0,Math.PI*2);ctx.fill();ctx.fillStyle='#399f70';ctx.beginPath();ctx.arc(t.x+3,t.y-21,Math.max(4,w/58),0,Math.PI*2);ctx.fill()}}
   // Thematic location marker used by older devices without WebGL.
   let signs={school:'🏫 TAN TRƯỜNG',market:'🧺 CHỢ PHIÊN',rain:'🌧️ CHỢ ĐÊM MƯA',wedding:'💍 TIỆC CƯỚI',hospital:'🚑 BỆNH VIỆN',stadium:'🏟️ SÂN VẬN ĐỘNG',fair:'📹 SỰ KIỆN LIVE',festival:'🎊 HỘI XUÂN',final:'🏆 CHUNG KẾT',office:'🏢 BÃI XE TRUNG TÂM'};
   if(signs[game.theme]){ctx.fillStyle='#123d50af';let tx=w*.5;ctx.beginPath();ctx.roundRect(tx-80,Math.max(8,h*.12),160,27,9);ctx.fill();ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff4ce';ctx.fillText(signs[game.theme],tx,Math.max(27,h*.12+18));}
   // booth, entry gate and the exit
   box(-4.48,.25,-2.55,1.06,.70,1.1,'#e6c99b');box(-4.48,.66,-2.55,1.22,.2,1.2,'#bd4d47');box(-4.47,.28,-1.995,.76,.43,.035,'#65c6dc');
   box(4.75,.30,.55,.35,.72,.34,'#ffd464');box(5.03,.55,.55,.60,.10,.09,'#ebf2ef');
   // painter's order: back to front
   let queue=[];for(let i=0;i<20;i++)if(game.board[i])queue.push(i);queue.sort((a,b)=>((Math.floor(a/5)+a%5)-(Math.floor(b/5)+b%5)));
   for(let i of queue){let v=game.board[i],p=this.pos(Math.floor(i/5),i%5),x=p[0],z=p[2],a=this.animations.get(v.id),yy=.14;
      if(a){a.t+=delta*3.8;let t=Math.min(a.t,1),e=t*t*(3-2*t);x=a.from[0]+(x-a.from[0])*e;z=a.from[2]+(z-a.from[2])*e;yy+=.15*Math.sin(Math.PI*e);if(t===1)this.animations.delete(v.id)}
      let target=v.id===game.currentTarget,selected=game.selected===i;
      if(target||selected){box(x,.010,z,1.11,.018,1.10,target?'#eccc47':'#4ee4ca')}
      const car=v.kind==='car'||v.kind==='ambulance',bike=v.kind==='bike';
      if(car){box(x,.20+yy,z,1.01,.40,.78,v.color);box(x-.08,.50+yy,z,.62,.30,.67,v.kind==='ambulance'?'#e7f5ee':'#bcdddf');box(x-.17,.54+yy,z,.17,.19,.68,'#578ca0');box(x+.20,.54+yy,z,.18,.18,.67,'#72aabe');for(let xx of [-.34,.35])for(let zz of [-.34,.34])box(x+xx,.09+yy,z+zz,.25,.23,.11,'#27313a')}
      else if(bike){for(let dx of [-.37,.35]){let q=project(x+dx,.24+yy,z+.03);ctx.strokeStyle='#202b31';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(q.x,q.y,Math.max(3,w/140),Math.max(4,w/105),0,0,Math.PI*2);ctx.stroke()}box(x,.33+yy,z,.63,.08,.07,v.color);box(x+.08,.52+yy,z,.09,.27,.08,'#d9eff0')}
      else{for(let dx of [-.37,.36]){let q=project(x+dx,.25+yy,z);ctx.beginPath();ctx.ellipse(q.x,q.y,Math.max(3,w/130),Math.max(4,w/100),0,0,Math.PI*2);ctx.fillStyle='#202935';ctx.fill();ctx.strokeStyle='#d6dddd';ctx.lineWidth=1.5;ctx.stroke()}
       box(x,.37+yy,z,.66,.26,.30,v.color);box(x-.10,.53+yy,z,.38,.16,.34,'#333f48');box(x+.29,.58+yy,z,.20,.28,.30,v.color);box(x+.42,.76+yy,z,.07,.06,.48,'#333b43');box(x+.43,.64+yy,z,.05,.09,.16,'#fff0ad')}
      if(v.locked){let q=project(x,.95+yy,z);ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.fillText('🔒',q.x,q.y)}
      if(target){let q=project(x,1.25+yy,z);let pulse=(1+Math.sin(this.time*5))*.5;ctx.shadowColor='#ffdb5f';ctx.shadowBlur=5+7*pulse;ctx.fillStyle='#fff9d8';ctx.strokeStyle='#9e6c24';ctx.lineWidth=2;let tw=Math.max(43,w*.14);ctx.beginPath();ctx.roundRect(q.x-tw/2,q.y-14,tw,21,6);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#422c1e';ctx.font=`900 ${Math.max(9,w/45)}px system-ui`;ctx.textAlign='center';ctx.fillText('XE CẦN LẤY',q.x,q.y-.5)}
   }
   if(game.selected!==null&&game.board[game.selected]){let r=Math.floor(game.selected/5),c=game.selected%5;for(let [dr,dc] of [[0,1],[0,-1],[-1,0],[1,0]]){let nr=r+dr,nc=c+dc;if(nr<0||nr>=4||nc<0||nc>=5||game.board[nr*5+nc])continue;let p=this.pos(nr,nc);box(p[0],.022,p[2],1.05,.015,1.05,'#64ffd1')}}
   let q=project(4.35,.23,.64);ctx.fillStyle='#36f6ac';ctx.font='900 '+Math.max(12,w/30)+'px system-ui';ctx.textAlign='center';ctx.fillText('➜',q.x,q.y);
   box(-4.90,.65,1.8,.6,1.11,.37,'#1b7657');let gp=project(-4.95,1.38,1.7);ctx.font=Math.max(12,w/19)+'px system-ui';ctx.fillText('👮',gp.x,gp.y);
  }
}
class Geometry{
 constructor(){this.data=[]}
 reset(){this.data.length=0}
 color(c,shade=1){if(c[0]!=='#')return [1,1,1];let s=c.slice(1),rgb=parseInt(s,16);return [((rgb>>16)&255)/255*shade,((rgb>>8)&255)/255*shade,(rgb&255)/255*shade].map(v=>Math.min(1,v))}
 tri(a,b,c,color,sh=1){let rgb=this.color(color,sh);for(let p of [a,b,c])this.data.push(p[0],p[1],p[2],...rgb)}
 quad(a,b,c,d,col,sh){this.tri(a,b,c,col,sh);this.tri(a,c,d,col,sh)}
 box(x,y,z,w,h,d,col){let l=x-w/2,r=x+w/2,bo=y-h/2,t=y+h/2,back=z-d/2,front=z+d/2;
  this.quad([l,t,front],[r,t,front],[r,t,back],[l,t,back],col,1.18);
  this.quad([l,bo,front],[l,bo,back],[r,bo,back],[r,bo,front],col,.57);
  this.quad([l,bo,front],[r,bo,front],[r,t,front],[l,t,front],col,.83);
  this.quad([r,bo,back],[l,bo,back],[l,t,back],[r,t,back],col,.68);
  this.quad([r,bo,front],[r,bo,back],[r,t,back],[r,t,front],col,1.05);
  this.quad([l,bo,back],[l,bo,front],[l,t,front],[l,t,back],col,.75);
 }
 cylinder(x,y,z,r,d,col,segments=10,axis='y'){
  let side=(i,t)=>{let ang=Math.PI*2*i/segments;let ca=Math.cos(ang)*r,sa=Math.sin(ang)*r;if(axis==='z')return [x+ca,y+sa,z+t*d/2];return [x+ca,y+t*d/2,z+sa];};
  for(let k=0;k<segments;k++){let a=side(k,-1),b=side(k+1,-1),c=side(k+1,1),dd=side(k,1);let sh=.65+.45*Math.cos((k+.5)*Math.PI*2/segments);this.quad(a,b,c,dd,col,sh);let center1=axis==='z'?[x,y,z-d/2]:[x,y-d/2,z],center2=axis==='z'?[x,y,z+d/2]:[x,y+d/2,z];this.tri(center1,b,a,col,.83);this.tri(center2,dd,c,col,1.07)}
 }
 sphere(x,y,z,r,col,sides=9,rings=5){for(let j=0;j<rings;j++){let t1=Math.PI*j/rings,t2=Math.PI*(j+1)/rings;for(let i=0;i<sides;i++){let f1=2*Math.PI*i/sides,f2=2*Math.PI*(i+1)/sides;const p=(t,f)=>[x+r*Math.sin(t)*Math.cos(f),y+r*Math.cos(t),z+r*Math.sin(t)*Math.sin(f)];let sh=1.10-.42*Math.cos(t1);this.quad(p(t1,f1),p(t1,f2),p(t2,f2),p(t2,f1),col,sh)}}}
 finish(){return new Float32Array(this.data)}
}
function mul(a,b){let out=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++){let sum=0;for(let k=0;k<4;k++)sum+=a[k*4+i]*b[j*4+k];out[j*4+i]=sum;}return out}
function transform(m,p){return [0,1,2,3].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]*p[3])}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])}
function lookAt(eye,center,up){let [ex,ey,ez]=eye,[cx,cy,cz]=center;let z=normalize([ex-cx,ey-cy,ez-cz]),x=normalize(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function normalize(a){let s=Math.hypot(...a)||1;return a.map(v=>v/s)}
function light(c,k){let n=parseInt(c.substring(1),16);const z=(bit)=>Math.round(Math.min(255,((n>>bit)&255)*k));return `rgb(${z(16)},${z(8)},${z(0)})`}
function dark(c,k){return light(c,k)}
