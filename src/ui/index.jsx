import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <App/>
);
// StrictMode turns on additional debugging
// root.render(
//   <React.StrictMode>
//     <App/>
//   </React.StrictMode>
// );
