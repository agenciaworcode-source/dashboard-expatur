import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 backdrop-blur-sm">
            <div className="text-center p-8 bg-card rounded-2xl shadow-xl border border-border/50 animate-in zoom-in duration-300">
                <h1 className="mb-4 text-7xl font-black text-primary/20">{t('common.not_found_title')}</h1>
                <p className="mb-8 text-xl text-muted-foreground font-medium">{t('common.not_found_text')}</p>
                <Link 
                    to="/" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 hover:scale-105 transition-all active:scale-95"
                >
                    {t('common.return_home')}
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
