import ActivityLog from './pages/ActivityLog';
import CustomRoles from './pages/CustomRoles';
import Export from './pages/Export';
import SETH from './pages/SETH';
import Simulations from './pages/Simulations';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityLog": ActivityLog,
    "CustomRoles": CustomRoles,
    "Export": Export,
    "SETH": SETH,
    "Simulations": Simulations,
}

export const pagesConfig = {
    mainPage: "SETH",
    Pages: PAGES,
    Layout: __Layout,
};