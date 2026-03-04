import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
    slug: 'tenants',
    admin: {
        useAsTitle: 'slug',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: "Store Name",
            admin: {
                description: "The name of the store. This will be displayed to customers."
            },
        },
        {
            name: 'slug',
            type: 'text',
            index: true,
            required: true,
            unique: true,
            admin: {
                description: "This is the subdomain for the store (eg. [slug].funroad.com)"
            }
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "stripeAccountId",
            type: "text",
            required: true,
            admin: {
                readOnly: true,
            },
        },
        {
            name: "stripeDetailsSubmitted",
            type: "checkbox",
            admin: {
                readOnly: true,
                description: "You cannot create products until you submit your stripe details",
            },
        },
    ],
};

