import './styles/main.scss';
import { initContactForm } from './modules/contact-form';
import { initNavigation } from './modules/navigation';
import {
  renderAbout,
  renderApproach,
  renderCases,
  renderContacts,
  renderStack,
  renderYear,
} from './modules/render';

renderStack();
renderAbout();
renderApproach();
renderCases();
renderContacts();
renderYear();

initNavigation();
initContactForm();
