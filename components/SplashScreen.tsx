import React from "react";

export function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const handleEnter = () => {
    // Som de Startup / Transição
    const startup = new Audio('https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3');
    startup.volume = 0.4;
    startup.play().catch(e => console.log("Audio blocked", e));

    // Boas-vindas Vocal (IA Nativa)
    setTimeout(() => {
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Bem-vindo ao iAmobil. Sua plataforma está pronta.";
      msg.lang = 'pt-BR';
      msg.rate = 0.9;
      msg.volume = 0.8;
      window.speechSynthesis.speak(msg);
    }, 600);


    onEnter();
  };

  return (
    <div 
      onClick={handleEnter} 
      style={{ 
        position:"fixed", 
        inset:0, 
        background:"#0f0f0f", 
        display:"flex", 
        flexDirection:"column", 
        alignItems:"center", 
        justifyContent:"center", 
        gap:"40px", 
        zIndex:99999, 
        cursor:"pointer", 
        fontFamily:"Segoe UI, system-ui, sans-serif" 
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"100px", padding:"8px 20px", color:"rgba(255,255,255,.5)", fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase" }}>
        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#a78bfa" }} />
        Plataforma Imobiliaria
      </div>
      <div style={{ fontSize:"40px", fontWeight:700, letterSpacing:"-1.5px", color:"#fff" }}>
        <span style={{ color:"#a78bfa" }}>iA</span>mobil
      </div>
      <div style={{ color:"rgba(255,255,255,.25)", fontSize:"12px", letterSpacing:"2px", textTransform:"uppercase" }}>
        clique para entrar
      </div>
    </div>
  );
}
