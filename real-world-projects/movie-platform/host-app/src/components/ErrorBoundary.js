import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert">
          <strong>Module cinema indisponible.</strong> {this.state.message}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => this.setState({ hasError: false, message: "" })}>Reessayer</button>
        </div>
      );
    }
    return this.props.children;
  }
}