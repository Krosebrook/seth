import SETH from './pages/SETH';
import Simulations from './pages/Simulations';
import CustomRoles from './pages/CustomRoles';
import ActivityLog from './pages/ActivityLog';
import Export from './pages/Export';
import __Layout from './Layout.jsx';


export const PAGES = {
    "SETH": SETH,
    "Simulations": Simulations,
    "CustomRoles": CustomRoles,
    "ActivityLog": ActivityLog,
    "Export": Export,
}

export const pagesConfig = {
    mainPage: "SETH",
    Pages: PAGES,
    Layout: __Layout,
};