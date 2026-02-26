import { RefObject } from "react";

export const useDropdownPosition = ( ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>) => {
    const getDropdownPosition = () => {
        if (!ref.current) return { top: 0, left: 0 };

        const rect = ref.current.getBoundingClientRect();
        const dropdownWith = 240; // Width of dropdown (w-60 = 15rem = 240px)
        // Calculate the initial psotion

        let left = rect.left + window.scrollX;
        const top = rect.bottom + window.scrollY;

        // Check if dropdown would go off the right edge of the viewport
        if (left + dropdownWith > window.innerWidth) {

            // Align to right edge of button instead
            left = rect.right + window.scrollX - dropdownWith;

            if (left < 0) {
                left = window.innerWidth - dropdownWith - 16; 
            }
        }

        if (left < 0) {
            left = 16; 
        }

        return { top, left };
    };

    return { getDropdownPosition };

};