// AuthContainer.tsx
import { useState } from "react";
import { TelaLogin } from "./TelaLogin";
// import { TelaCadastro } from "./TelaCadastro";
import { TelaRecuperarSenha } from "./TelaRecuperarSenha";

export const AuthContainer = () => {
  // "login" | "cadastro" | "recuperar"
  const [mode, setMode] = useState("login");

  return (
    <>
      {mode === "login" && <TelaLogin />}
      {/* {mode === "login" && <TelaLogin onChangeMode={setMode} />} */}
      {/* {mode === "cadastro" && <TelaCadastro onChangeMode={setMode} />} */}
      {mode === "recuperar" && <TelaRecuperarSenha onChangeMode={setMode} />}
    </>
  );
};
