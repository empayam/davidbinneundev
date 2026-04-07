import Layout from "./Layout.jsx";

import Home from "./Home";

import Admin from "./Admin";

import AdminProjects from "./AdminProjects";

import AdminCTFs from "./AdminCTFs";

import AdminEducation from "./AdminEducation";

import AdminContact from "./AdminContact";

import AdminTechnologies from "./AdminTechnologies";
import AdminLogin from "./AdminLogin";

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

function PagesContent() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Navigate to="/" replace />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/ctfs" element={<AdminCTFs />} />
                <Route path="/admin/education" element={<AdminEducation />} />
                <Route path="/admin/contact" element={<AdminContact />} />
                <Route path="/admin/technologies" element={<AdminTechnologies />} />

                <Route path="/Admin" element={<Navigate to="/admin" replace />} />
                <Route path="/AdminProjects" element={<Navigate to="/admin/projects" replace />} />
                <Route path="/AdminCTFs" element={<Navigate to="/admin/ctfs" replace />} />
                <Route path="/AdminEducation" element={<Navigate to="/admin/education" replace />} />
                <Route path="/AdminContact" element={<Navigate to="/admin/contact" replace />} />
                <Route path="/AdminTechnologies" element={<Navigate to="/admin/technologies" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
