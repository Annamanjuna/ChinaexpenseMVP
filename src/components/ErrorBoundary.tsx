"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: string | null };

/** Ловит падения React и показывает текст вместо белого экрана */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(err: unknown): State {
    const message =
      err instanceof Error ? err.message : "Неизвестная ошибка";
    return { error: message };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-4 rounded-xl border border-danger-500/40 bg-danger-50 p-4 text-sm text-danger-800">
          <p className="font-semibold">Ошибка в приложении</p>
          <p className="mt-2 break-words">{this.state.error}</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-white px-3 py-2 text-danger-700"
            onClick={() => this.setState({ error: null })}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
