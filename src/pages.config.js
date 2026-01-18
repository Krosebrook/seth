import SETH from './pages/SETH';
import OrderManagement from './pages/OrderManagement';
import InventoryDashboard from './pages/InventoryDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "SETH": SETH,
    "OrderManagement": OrderManagement,
    "InventoryDashboard": InventoryDashboard,
}

export const pagesConfig = {
    mainPage: "SETH",
    Pages: PAGES,
    Layout: __Layout,
};