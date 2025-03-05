import { Link } from "react-router-dom";

interface ButtonLoginProps {
    type: 'CPF' | 'Entrar' | 'Cadastrar' | 'Pedidos';
}

const buttonStyle = "w-72 h-20 bg-white font-bold text-[22px] text-center my-[4px] rounded-lg text-black shadow-2xl hover:opacity-90"
const buttonCPFStyle = "w-72 h-20 bg-white font-bold text-[22px] text-left my-[4px] rounded-lg text-black pl-4"

export const ButtonLogin = ({type}: ButtonLoginProps) => {
    switch (type) {
        case 'CPF':
            return <input type="text" name="cpf" id="cpf" placeholder="CPF" className={buttonCPFStyle} />;
        
        case 'Cadastrar':
            return (
                <Link to="/cadastro">
                    <button className={buttonStyle}>{type}</button>
                </Link>
            );

        case 'Pedidos':
            return (
                <Link to="/pedidos">
                    <button className={buttonStyle}>{type}</button>
                </Link>
            );

        case 'Entrar':
            return (
                <button className={buttonStyle}>{type}</button>
            );

        default:
            return <button className={buttonStyle}>{type}</button>;
    }
}