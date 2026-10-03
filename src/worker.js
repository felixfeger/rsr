const A={"name": "Republic State Railways", "preset": "red", "phone": "1-800-RSR-333", "email": "hello@citymetro.xyz"};
const c=(s,n)=>String(s||'').slice(0,n);
async function wallet(request,env){
  let b;try{b=await request.json()}catch{return Response.json({error:'Bad request'},{status:400})}
  const body={logoText:A.name,organizationName:A.name,colorPreset:A.preset,expirationDays:1,sharingProhibited:true,
    barcodeFormat:'QR',barcodeValue:c(b.code,60)+'|'+c(b.from,40)+'|'+c(b.to,40)+'|'+c(b.type,20)+'|'+(+b.riders||1),barcodeAltText:c(b.code,60),
    headerFields:[{label:'DATE',value:c(b.date,20)}],
    primaryFields:[{label:'ROUTE',value:c(b.from,40)+' → '+c(b.to,40)}],
    secondaryFields:[{label:'LINE',value:c(b.line,40)},{label:'FARE',value:c(b.type,20)},{label:'RIDERS',value:String(+b.riders||1)}],
    backFields:[{label:'Support',value:A.phone+' · '+A.email}]};
  const r=await fetch('https://api.walletwallet.dev/api/passes',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.WALLETWALLET_KEY},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)return Response.json({error:j.error||'Wallet service error'},{status:502});
  return Response.json({googleSaveUrl:j.googleSaveUrl,shareUrl:j.shareUrl});
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/wallet') {
      if (request.method === 'GET') return Response.json({ ok: true, keyConfigured: !!env.WALLETWALLET_KEY });
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      return wallet(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
