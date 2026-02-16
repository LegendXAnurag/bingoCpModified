'use client';

const links: Record<string, string> = {
    "Home": '/',
    "Bingo": '/create-match',
    "Tug of War": '/tug-mode',
    "Help": '/help',
};

export default function NavBar() {
    return (
        <header className="w-full bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-20">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
                <a href="/">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text tracking-wide">
                        Bingo CP
                    </h1>
                </a>
                <div className="flex items-center space-x-4 border-l pl-6 ml-4 dark:border-gray-600">
                    {Object.keys(links).map(label => (
                        <a key={label} href={links[label]}>
                            <button className="cursor-pointer px-4 py-1 rounded bg-gray-200 dark:bg-white-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
                                {label}
                            </button>
                        </a>
                    ))}
                </div>
            </div>
        </header>
    );
}
