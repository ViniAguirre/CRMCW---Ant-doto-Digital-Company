import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AccountTag } from '../types';
import { TagIcon, TrashIcon } from './icons';

interface TagManagerProps {
    contactTags: string[];
    allTags: AccountTag[];
    onTagsUpdate: (newTags: string[]) => void;
    onTagCreate: (tag: AccountTag) => Promise<void>;
    onTagDelete: (tagTitle: string) => Promise<void>;
    onTagUpdate: (oldTitle: string, updatedTag: AccountTag) => Promise<void>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#f59e0b', '#6366f1'];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const TagManager: React.FC<TagManagerProps> = ({
    contactTags,
    allTags,
    onTagsUpdate,
    onTagCreate,
    onTagDelete,
    onTagUpdate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTag, setEditingTag] = useState<AccountTag | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setEditingTag(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tagsMap = useMemo(() => new Map(allTags.map(tag => [tag.title, tag])), [allTags]);

    const filteredTags = useMemo(() => {
        if (!searchTerm) return allTags;
        return allTags.filter(tag => tag.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, allTags]);

    const canCreateTag = useMemo(() => {
        return searchTerm && !allTags.some(tag => tag.title.toLowerCase() === searchTerm.toLowerCase());
    }, [searchTerm, allTags]);

    const handleToggleTag = (tagTitle: string) => {
        const newTags = contactTags.includes(tagTitle)
            ? contactTags.filter(t => t !== tagTitle)
            : [...contactTags, tagTitle];
        onTagsUpdate(newTags);
    };
    
    const handleCreateTag = async () => {
        if (!canCreateTag) return;
        const newTag: AccountTag = { title: searchTerm, color: getRandomColor() };
        await onTagCreate(newTag);
        handleToggleTag(newTag.title);
        setSearchTerm('');
    };

    const handleEditTag = (e: React.FormEvent<HTMLFormElement>, oldTitle: string) => {
        e.preventDefault();
        const newTitle = (e.currentTarget.elements.namedItem('title') as HTMLInputElement).value;
        const newColor = (e.currentTarget.elements.namedItem('color') as HTMLInputElement).value;
        if (newTitle && newColor && (newTitle !== oldTitle || newColor !== editingTag?.color)) {
            onTagUpdate(oldTitle, { title: newTitle, color: newColor });
        }
        setEditingTag(null);
    };

    const renderTag = (tagTitle: string) => {
        const tagData = tagsMap.get(tagTitle);
        const color = tagData?.color || '#6b7280';
        return (
             <span
                key={tagTitle}
                className="flex items-center text-xs font-medium text-white rounded-full"
                style={{ backgroundColor: color }}
            >
                <span className="pl-2 pr-1">{tagTitle}</span>
                <button
                    onClick={() => handleToggleTag(tagTitle)}
                    className="ml-1 mr-1 p-0.5 rounded-full hover:bg-black/20 focus:outline-none"
                    aria-label={`Remover tag ${tagTitle}`}
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </span>
        );
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
                {contactTags.map(renderTag)}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-2.5 py-1.5 rounded-full hover:bg-brand-orange/20 transition-colors"
                >
                    + Adicionar
                </button>
            </div>
            {isOpen && (
                <div ref={popoverRef} className="absolute z-10 w-64 mt-2 bg-white border rounded-lg shadow-xl" >
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Buscar ou criar etiqueta..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded-md focus:ring-brand-orange focus:border-brand-orange"
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto text-sm">
                        {filteredTags.map(tag => (
                            <li key={tag.title} className="group flex items-center justify-between px-3 py-1.5 hover:bg-gray-50">
                                {editingTag?.title === tag.title ? (
                                    <form onSubmit={(e) => handleEditTag(e, tag.title)} className="flex items-center w-full gap-2">
                                        <input type="color" name="color" defaultValue={tag.color} className="h-5 w-5 border-none p-0 rounded" />
                                        <input type="text" name="title" defaultValue={tag.title} className="flex-1 text-sm border-b focus:outline-none" autoFocus />
                                        <button type="submit" className="text-xs font-bold text-green-600">Salvar</button>
                                    </form>
                                ) : (
                                    <>
                                        <button onClick={() => handleToggleTag(tag.title)} className="flex items-center w-full text-left">
                                            <input type="checkbox" readOnly checked={contactTags.includes(tag.title)} className="mr-2 form-checkbox h-4 w-4 text-brand-orange rounded focus:ring-brand-orange" />
                                            <span className="flex items-center">
                                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>
                                                {tag.title}
                                            </span>
                                        </button>
                                        <div className="hidden group-hover:flex items-center">
                                            <button onClick={() => setEditingTag(tag)} className="p-1 text-gray-400 hover:text-brand-black">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => onTagDelete(tag.title)} className="p-1 text-gray-400 hover:text-red-600">
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                        {canCreateTag && (
                            <li className="px-2 py-2 border-t">
                                <button
                                    onClick={handleCreateTag}
                                    className="w-full text-left text-sm flex items-center p-1 rounded-md text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20"
                                >
                                    <TagIcon className="w-4 h-4 mr-2" />
                                    Criar etiqueta: "{searchTerm}"
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
