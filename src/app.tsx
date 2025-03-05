import { BrowserRouter } from 'react-router-dom';
import { MainRouter } from './routers/MainRouters';

function App() {
    return (
        <BrowserRouter>
            <MainRouter />
        </BrowserRouter>
    );
}

export default App;
