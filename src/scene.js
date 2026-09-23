import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { PLYExporter } from "three/addons/exporters/PLYExporter.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

const BLUE=0x2563EB, GREEN=0x059669, DARK=0x0F172A, WHITE=0xF8FAFC, TITAN=0xCBD5E1, VIOLET=0x8B5CF6;
export function createStudio(container){
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0xF8FAFC);
  const camera=new THREE.PerspectiveCamera(42,1,.01,200); camera.position.set(6,4.5,7);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15; container.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(0,0.4,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xdbe4f0,2.5));
  const key=new THREE.DirectionalLight(0xffffff,3); key.position.set(5,8,5); scene.add(key);
  const rim=new THREE.PointLight(BLUE,18,20,2); rim.position.set(-4,3,-3); scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92})); floor.rotation.x=-Math.PI/2; floor.position.y=-1.65; scene.add(floor);
  const grid=new THREE.GridHelper(20,40,0xd7dee8,0xe9edf3); grid.position.y=-1.64; scene.add(grid);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(1,1),.65,.65,.82));
  let current=null; let wireframeEnabled=false; const resize=()=>{const w=container.clientWidth||800,h=container.clientHeight||600;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h)}; const ro=new ResizeObserver(resize); ro.observe(container); resize();
  let raf; const tick=()=>{raf=requestAnimationFrame(tick);controls.update();composer.render()}; tick();
  const frameCurrent=()=>{if(!current)return;const box=new THREE.Box3().setFromObject(current),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const radius=Math.max(size.x,size.y,size.z)*.5;const distance=Math.max(3.5,radius/Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*1.25);const dir=new THREE.Vector3(1,.72,1).normalize();camera.position.copy(center).add(dir.multiplyScalar(distance));camera.near=Math.max(.01,distance/100);camera.far=Math.max(200,distance*20);camera.updateProjectionMatrix();controls.target.copy(center);controls.update()};
  const resetView=()=>{camera.position.set(6,4.5,7);camera.near=.01;camera.far=200;camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.update()};
  const setWireframe=(enabled)=>{wireframeEnabled=enabled;if(!current)return;current.traverse(o=>{if(o.isMesh&&o.material){const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>{if("wireframe" in m)m.wireframe=enabled;m.needsUpdate=true})}})};
  return {scene,camera,renderer,controls,setCurrent(g){if(current)scene.remove(current);current=g;scene.add(g);setWireframe(wireframeEnabled);frameCurrent()},getCurrent:()=>current,frameCurrent,resetView,setWireframe,destroy(){cancelAnimationFrame(raf);ro.disconnect();renderer.dispose()}};
}
function mat(color,roughness=.28,metalness=.28,emissive=0,ei=0){return new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.8,clearcoatRoughness:.12,emissive,emissiveIntensity:ei})}
function addRing(g,r=1.25,t=.075,axis="y",color=BLUE){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,18,96),mat(color,.16,.35,color,.75));if(axis==="x")o.rotation.y=Math.PI/2;if(axis==="z")o.rotation.x=Math.PI/2;g.add(o);return o}
function addCore(g,s=.42){const o=new THREE.Mesh(new THREE.SphereGeometry(s,32,24),mat(GREEN,.06,.15,GREEN,1.8));g.add(o);return o}
function seedHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0)/4294967295}
function softBody(g,seed,scale=1){
  const mc=new MarchingCubes(28,new THREE.MeshPhysicalMaterial({color:WHITE,roughness:.17,metalness:.22,clearcoat:1,clearcoatRoughness:.08}),true,false);
  mc.isolation=80; mc.scale.set(3.6*scale,1.7*scale,2.2*scale); mc.position.y=.15; mc.reset();
  const s=.22+seed*.12; mc.addBall(.32,.5,.5,1+s,12); mc.addBall(.5,.52,.5,1.2+s,12); mc.addBall(.68,.5,.5,1+s,12); mc.addBall(.5,.64,.5,.55+s,12); g.add(mc); return mc;
}
function fin(g,x,y,z,rot=0){const o=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.95,8,16),mat(TITAN,.22,.48));o.position.set(x,y,z);o.rotation.z=rot;g.add(o)}
function panels(g,span=2.5){for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.TorusGeometry(span*(.36+i*.07),.012,6,64),mat(BLUE,.25,.2,BLUE,.9));c.rotation.x=Math.PI/2;c.position.y=.08+i*.035;g.add(c)}}
function makeMonocoque(asset,seed,scale){const g=new THREE.Group();g.name="BEYOND2126_MONOCOQUE";softBody(g,seed,scale);addRing(g,1.25*scale,.07,"x",BLUE).position.x=1.42*scale;addRing(g,1.25*scale,.07,"x",BLUE).position.x=-1.42*scale;addCore(g,.38*scale);panels(g,2.5*scale);fin(g,0,.6*scale,-1*scale,.55);fin(g,0,.6*scale,1*scale,-.55);return g}
function makeHuman(seed,scale){const g=new THREE.Group();g.name="BEYOND2126_HUMANITY";const bodyMat=mat(WHITE,.2,.25),dark=mat(DARK,.2,.5);const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.55*scale,1.25*scale,12,24),bodyMat);torso.position.y=.45*scale;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.4*scale,32,24),dark);head.position.y=1.72*scale;g.add(head);for(const x of [-.72,.72]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14*scale,.95*scale,8,16),bodyMat);arm.position.set(x*scale,.45*scale,0);arm.rotation.z=x>0?-.18:.18;g.add(arm)}for(const x of [-.3,.3]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.17*scale,.95*scale,8,16),bodyMat);leg.position.set(x*scale,-.72*scale,0);g.add(leg)}const visor=new THREE.Mesh(new THREE.TorusGeometry(.27*scale,.025*scale,8,64),mat(BLUE,.12,.25,BLUE,1.5));visor.position.set(0,1.72*scale,.38*scale);g.add(visor);addRing(g,.85*scale,.025,"y",BLUE).position.y=.55*scale;return g}
function makeBio(asset,seed,scale){const g=new THREE.Group();g.name="BEYOND2126_BIOMIMICRY";const body=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),mat(WHITE,.25,.3));body.scale.set(1.55*scale,.78*scale,.7*scale);body.position.y=.1*scale;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.58*scale,32,20),mat(WHITE,.22,.3));head.position.set(1.15*scale,.35*scale,0);g.add(head);for(const z of [-.38,.38]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.09*scale,16,12),mat(BLUE,.1,.2,BLUE,2));eye.position.set(1.48*scale,.43*scale,z*scale);g.add(eye)}for(const x of [-.8,0,.8])fin(g,x*scale,-.35*scale,0,x*.35);addRing(g,.72*scale,.035,"x",BLUE).position.set(-1.05*scale,.05,0);if(/oiseaux|ailes|papillon/i.test(asset)){for(const z of [-1,1]){const w=new THREE.Mesh(new THREE.SphereGeometry(.7*scale,24,16),mat(TITAN,.18,.4,BLUE,.2));w.scale.set(.22,1.1,.9);w.position.set(0,.55,z*.65*scale);g.add(w)}}return g}
function makeArch(asset,seed,scale){const g=new THREE.Group();g.name="BEYOND2126_ARCHITECTURAL";const h=1.5+seed*2.5,w=1.8+seed*1.7,base=mat(WHITE,.2,.28),glass=mat(0x9fb4c9,.08,.35,BLUE,.15);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(w*(1-i*.08)*scale,h*(1-i*.06)*scale,.65*scale),base);b.position.y=(h*(.5+i)*.25-1.1)*scale;g.add(b)}const dome=new THREE.Mesh(new THREE.SphereGeometry(w*.55*scale,32,18,0,Math.PI*2,0,Math.PI/2),glass);dome.position.y=h*.55*scale;g.add(dome);for(const x of [-1,1])addRing(g,.55*scale,.035,"y",x>0?BLUE:VIOLET).position.x=x*w*.72*scale;const road=new THREE.Mesh(new THREE.BoxGeometry(5*scale,.025,.45*scale),mat(DARK,.5,.1));road.position.y=-1.58;g.add(road);for(let i=-4;i<=4;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.22*scale,.03,.06*scale),mat(BLUE,.15,.1,BLUE,1.4));l.position.set(i*.55*scale,-1.55,0);g.add(l)}return g}
export function generateAsset({category,subcategory,asset,scale=1}){const s=Math.max(.65,Math.min(1.45,Number(scale)||1)),h=seedHash(category+"|"+subcategory+"|"+asset);if(category==="MONOCOQUE")return makeMonocoque(asset,h,s);if(category==="HUMANITÉ 2126")return makeHuman(h,s);if(category==="BIOMIMICRY")return makeBio(asset,h,s);return makeArch(asset,h,s)}
export function exportGLTF(object,binary=true){return new Promise((resolve,reject)=>new GLTFExporter().parse(object,r=>resolve(r),reject,{binary,trs:false,onlyVisible:true}))}
export function exportPLY(object){return new PLYExporter().parse(object,{binary:true})}
export function downloadBlob(data,name,type="application/octet-stream"){const blob=data instanceof Blob?data:new Blob([data],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
export function createB3DBridge(meta){return "# GLORIFIED / BEYOND 2126 — Blender B3D bridge
# Browser export is not a native B3D encoder; install a Blender B3D exporter/add-on.
import bpy
META = "+JSON.stringify(meta)+"
print('Rebuild asset from META:', META)
print('Export with the installed B3D exporter/add-on.')
"}
