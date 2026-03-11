'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SidebarSection {
    id: string;
    title: string;
}

interface SidebarProps {
    sections: SidebarSection[];
}

export default function Sidebar({ sections }: SidebarProps) {
    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

    useEffect(() => {
        const observers = Array.from(document.querySelectorAll('section[id]')).map((section) => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveSection(entry.target.id);
                        }
                    });
                },
                { rootMargin: '-20% 0px -80% 0px' }
            );
            observer.observe(section);
            return observer;
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, [sections]);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100; // Adjust for sticky header
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="sticky top-24 w-64 hidden lg:block shrink-0 self-start">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-4 border-l-2 border-transparent">
                On this page
            </h3>
            <ul className="space-y-2">
                {sections.map(({ id, title }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            onClick={(e) => handleScroll(e, id)}
                            className={`block pl-4 py-1 border-l-2 transition-colors duration-200 text-sm ${activeSection === id
                                ? 'border-cyan-400 text-cyan-400 font-medium'
                                : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                }`}
                        >
                            {title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
