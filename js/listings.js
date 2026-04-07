/**
 * Highmark Associates - Property Listings Data
 * 
 * To add a new property, copy an existing object and update its details. 
 * Categories: 'sale', 'rent', 'plot', 'commercial'
 */

export const listings = [
  {
    id: 1,
    category: 'sale',
    type: 'House',
    title: 'Brand New 1 Kanal Double Story House',
    location: 'E-11/4, Islamabad',
    price: 'PKR 8.5 Crore',
    priceNote: 'negotiable',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    specs: {
      area: '1 Kanal',
      beds: '5',
      baths: '6'
    },
    tags: ['Margalla View', 'CDA Approved'],
    featured: true
  },
  {
    id: 2,
    category: 'rent',
    type: 'Apartment',
    title: 'Furnished 2-Bed Flat - Capital Residencia',
    location: 'E-11/2, Islamabad',
    price: 'PKR 75,000',
    priceNote: '/month',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    specs: {
      area: '1,200 sq.ft',
      beds: '2',
      baths: '2'
    },
    tags: ['Furnished', 'CDA Approved'],
    featured: true
  },
  {
    id: 3,
    category: 'commercial',
    type: 'Plot',
    title: 'Prime Commercial Plot - Service Road North',
    location: 'E-11 Markaz, Islamabad',
    price: 'PKR 4.2 Crore',
    priceNote: '',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    specs: {
      area: '4 Marla',
      type: 'Corner',
      usage: 'Commercial'
    },
    tags: ['Prime Location', 'CDA Approved'],
    featured: true
  },
  {
    id: 4,
    category: 'plot',
    type: 'Plot',
    title: '10 Marla Residential Plot - Main Double Road',
    location: 'E-11/4, Islamabad',
    price: 'PKR 2.1 Crore',
    priceNote: '',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    specs: {
      area: '10 Marla',
      type: 'Residential',
      note: 'Clear Title'
    },
    tags: ['Investment', 'CDA Approved'],
    featured: false
  },
  {
    id: 5,
    category: 'sale',
    type: 'Plot',
    title: '1 Kanal Plot - DHA Phase 2',
    location: 'DHA Phase 2, Islamabad',
    price: 'PKR 4.5 Crore',
    priceNote: '',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80',
    specs: {
      area: '1 Kanal',
      type: 'DHA Allotted',
      security: 'Gated'
    },
    tags: ['Gated Community', 'Elite Area'],
    featured: false
  },
  {
    id: 6,
    category: 'sale',
    type: 'House',
    title: 'Modern 10 Marla Villa - Bahria Town',
    location: 'Bahria Town Phase 7, Rawalpindi',
    price: 'PKR 3.8 Crore',
    priceNote: '',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    specs: {
      area: '10 Marla',
      beds: '4',
      baths: '4'
    },
    tags: ['Installments', 'Gated'],
    featured: false
  }
];
