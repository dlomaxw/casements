export interface Project {
  name: string;
  location: string;
  completion: string;
  scope: string;
  image: string;
}

// Real featured projects from casements.co.ug/about-us
export const projects: Project[] = [
  {
    name: 'Course View Tower',
    location: 'Plot 21, Yusuf Lule Road, Nakasero, Kampala',
    completion: 'December 2010',
    scope: 'ACP Cladding, Aluminium Fins, Shop-Fronts, Frameless Partitioning, Automatic Doors',
    image: '/images/projects/crested-tower.png',
  },
  {
    name: 'Crested Tower',
    location: 'Plot 21, Kintu Road, Kampala',
    completion: 'November 2003',
    scope: 'Aluminium Doors & Windows, Curtain Walling, ACP Cladding, Sun Shading',
    image: '/images/projects/crested-tower.png',
  },
  {
    name: 'Proposed Residential Apartments',
    location: 'Baker Road, Kampala',
    completion: 'October 2016',
    scope: 'Aluminium Windows & Doors, Curtain Walling, Frameless Glass Railing',
    image: '/images/projects/residential-apartments.png',
  },
  {
    name: 'Proposed Residence',
    location: 'Ntinda, Kampala',
    completion: '2016',
    scope: 'Heavy Duty C.A.L. Series, Luxury Aluminium Windows & Doors',
    image: '/images/projects/residence-ntinda.png',
  },
  {
    name: 'Office of the Auditor General',
    location: 'Nakasero, Kampala',
    completion: 'December 2014',
    scope: 'Aluminium Windows & Doors, Partitioning, Suspended Ceiling, Automatic Door',
    image: '/images/projects/auditor-general.png',
  },
  {
    name: 'BMK House',
    location: 'Wampewo Avenue, Kampala',
    completion: '2017',
    scope: 'Aluminium Windows & Doors, Curtain Walling, Stainless Steel Railing',
    image: '/images/projects/bmk-house.png',
  },
];
