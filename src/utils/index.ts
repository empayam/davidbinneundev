
export function createPageUrl(pageName: string) {
    const routes: Record<string, string> = {
        Home: '/',
        Admin: '/admin',
        AdminProjects: '/admin/projects',
        AdminCTFs: '/admin/ctfs',
        AdminEducation: '/admin/education',
        AdminContact: '/admin/contact',
        AdminTechnologies: '/admin/technologies',
        AdminLogin: '/admin/login',
    };

    return routes[pageName] || '/' + pageName.toLowerCase().replace(/ /g, '-');
}
