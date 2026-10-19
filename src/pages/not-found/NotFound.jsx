import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section
      className="relative flex min-h-[calc(100vh-220px)] w-full items-center overflow-hidden px-6 py-6 sm:px-10 lg:px-16"
      style={{ backgroundImage: 'var(--gradient-page-gold-subtle)' }}
    >
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center justify-center">
          <div className="text-center">
            <p
              className="m-0 bg-clip-text text-[clamp(6rem,11vw,10rem)] font-bold leading-[0.8] tracking-[-0.06em] text-transparent"
              style={{ backgroundImage: 'var(--gradient-brand-gold)' }}
            >
              404
            </p>

            <h1 className="mb-0 mt-5 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
              Page not found
            </h1>

            <p className="mx-auto mb-0 mt-3 max-w-lg text-sm leading-6 text-stone-500">
              The page you are looking for may have been moved, deleted, or is unavailable.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button icon={Home} onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>

              <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>

          </div>
        </div>
    </section>
  );
}
