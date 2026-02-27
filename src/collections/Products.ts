import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: "products",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "text",
        },
        {
            name: "price",
            type: "number",
            required: true,
            min: 0,
            admin: {
                description: "Price in USD",
            },
        },
        {
            name: "category",
            type: "relationship",
            relationTo: "categories",
            required: true,
            hasMany: false,
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
        }, 
        {
            name: 'refundPolicy',
            type: 'select',
            options: [
                { label: 'No Refunds', value: 'no-refunds' },
                { label: '1 Day', value: '1-day' },
                { label: '3 Day', value: '3-day' },
                { label: '7 Day', value: '7-day' },
                { label: '14 Day', value: '14-day' },
                { label: '30 Day', value: '30-day' },

            ],
            defaultValue: '30-day',
        }
    ],

}