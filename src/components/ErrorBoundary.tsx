import React from 'react';

interface ErrorBoundaryProps {
    fallback: React.ReactNode;
    children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, {hasError: boolean}> {
    state = {hasError: false};

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}

export default ErrorBoundary;
