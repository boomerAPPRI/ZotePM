import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Processing login...</p>
        </div>
    );
};

export default LoginCallback;
