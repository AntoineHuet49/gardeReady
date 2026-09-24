function Footer() {
    const version = import.meta.env.VITE_APP_VERSION || "dev";
    return (
        <footer className="fixed bottom-1 right-2 text-xs text-base-content/50">
            v{version}
        </footer>
    );
}

export default Footer;
