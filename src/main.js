// Application entry point: load styles, apply theme and boot the router.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './styles/main.css';

import { applyTheme } from './components/theme.js';
import { startRouter } from './router/router.js';
import { routes } from './routes.js';

applyTheme();
startRouter(routes);
