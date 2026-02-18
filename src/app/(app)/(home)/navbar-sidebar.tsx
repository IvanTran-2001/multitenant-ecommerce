import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";

import Link from "next/link";

import { ScrollArea } from "@/components/ui/scroll-area";

interface NavBarItem {
    href: string;
    children: React.ReactNode;
}

interface Props {
    items: NavBarItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const linkClassName = "w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium";

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
                    {items.map((item) => (
                        <Link href={item.href} key={item.href} className={linkClassName} onClick={() => onOpenChange(false)}>
                            {item.children}
                        </Link>

                    ))}

                    <div className="border-t">
                        <Link href="/sign-in" className={linkClassName} onClick={() => onOpenChange(false)}>
                            Login
                        </Link>
                        <Link href="/sign-up" className={linkClassName} onClick={() => onOpenChange(false)}>
                            Start Selling
                        </Link>

                    </div>

                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}