import React from 'react';

export default function InventoryLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {/* ...existing layout elements like header, footer, etc., if any... */}
                {children}
            </body>
        </html>
    );
}
