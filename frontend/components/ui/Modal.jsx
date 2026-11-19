/**
 * Modal Component
 *
 * Accessible overlay modal with backdrop dismiss and keyboard (Escape) support.
 *
 * @param {object}         props
 * @param {boolean}        props.isOpen     — controls visibility
 * @param {Function}       props.onClose    — called when backdrop/Escape pressed
 * @param {string}         [props.title]    — modal heading
 * @param {React.ReactNode} props.children
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean}        [props.isConfirmation] — shows confirm/cancel buttons
 * @param {Function}       [props.onConfirm] — called when confirm button clicked
 * @param {string}         [props.confirmLabel='Confirm'] — confirm button text
 * @param {string}         [props.cancelLabel='Cancel'] — cancel button text
 * @param {string}         [props.confirmVariant='primary'] — confirm button variant
 *
 * Keyboard behavior: focus moves into the dialog on open, Tab/Shift+Tab
 * cycle within it (useFocusTrap), Escape closes it, and focus returns to
 * the element that opened it on close.
 *
 * Animation: the panel scales and fades in on open and out on close. The
 * entering state is exposed via `data-state="open"` on the panel. When
 * `prefers-reduced-motion: reduce` matches, the transform is disabled and
 * only opacity transitions (or none) are used.
 */

'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

const EXIT_DURATION_MS = 150;

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  isConfirmation = false,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
}) {
  const trapRef = useFocusTrap(isOpen);

  // Track whether the panel is entering (open) or exiting (closing).
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isEntering, setIsEntering] = useState(false);

  // Drive enter/exit transitions. On open, mount then flip to the entering
  // state on the next frame so the transition runs. On close, keep the panel
  // mounted for the exit duration before unmounting.
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const raf = requestAnimationFrame(() => setIsEntering(true));
      return () => cancelAnimationFrame(raf);
    }

    setIsEntering(false);
    const timer = setTimeout(() => setIsVisible(false), EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150
                    motion-reduce:transition-none ${isEntering ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={trapRef}
        tabIndex={-1}
        data-state={isEntering ? 'open' : 'closed'}
        className={`relative w-full ${SIZE_CLASSES[size]} bg-gray-900 border border-gray-800
                    rounded-2xl shadow-2xl p-6 space-y-4 focus:outline-none
                    transition-[opacity,transform] duration-150 ease-out
                    motion-reduce:transition-opacity motion-reduce:duration-150
                    ${isEntering
                      ? 'opacity-100 scale-100 motion-reduce:scale-100'
                      : 'opacity-0 scale-95 motion-reduce:scale-100'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
          )}
          {/* Accessibility: aria-label describes action; focus-visible ring for keyboard users */}
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-white transition-colors p-1 rounded-lg
                       hover:bg-gray-800 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                       focus-visible:ring-offset-gray-900"
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Footer with Confirmation Buttons */}
        {isConfirmation && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button variant={confirmVariant} className="flex-1" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
