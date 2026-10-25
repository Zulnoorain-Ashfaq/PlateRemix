import React from 'react'
function Brand() { return <span className="brand"><span className="brand-mark">P<span>↗</span></span><span>Plate<span className="brand-accent">Remix</span></span></span> }
export default function App(){return <><header className="topbar"><div className="nav-shell"><Brand/></div></header><main className="app-shell"><div className="page-heading"><h1>Your personal recipe space</h1></div></main></>}
