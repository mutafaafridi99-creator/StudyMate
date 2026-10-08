// Last line of defence: if anything unexpected crashes the UI, show a
// friendly message with a reload button instead of a blank screen.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Intentionally silent: never print internal details.
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fatal">
        <h1>Oops, something went wrong</h1>
        <p>StudyMate AI hit an unexpected problem. Your notes are safe. Please reload the page.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}
