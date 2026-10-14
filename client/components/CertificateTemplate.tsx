import React, { forwardRef, useLayoutEffect, useRef } from 'react';

interface CertificateProps {
  participantName: string;
  prn: string;
  submittedAt: string;
}

// html2canvas (used for the PDF) can't paint radial gradients, object-fit or flex-centred text reliably,
// so this template sticks to solid fills, linear gradients and explicit line-heights.
const C = {
  paper: '#fffdf8',
  navy: '#14213d',
  gold: '#c9a227',
  goldLight: '#ecd68c',
  goldDark: '#9a7a14',
  green: '#15803d',
  violet: '#6d28d9',
  crimson: '#b91c1c',
  orange: '#ea580c',
  ink: '#334155',
  muted: '#64748b',
};

const goldGradient = `linear-gradient(90deg, ${C.goldDark}, ${C.goldLight} 50%, ${C.goldDark})`;
// Fonts come from next/font in app/layout.tsx.
const F = {
  display: 'var(--font-cinzel, "Cinzel"), serif',
  script: 'var(--font-great-vibes, "Great Vibes"), cursive',
  serif: 'var(--font-cormorant, "Cormorant Garamond"), serif',
};

const brandGradient = `linear-gradient(90deg, ${C.green}, ${C.violet} 35%, ${C.crimson} 70%, ${C.orange})`;

// Art-deco corner ornament: two nested L-brackets plus a diamond, mirrored per corner.
const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const top = pos[0] === 't';
  const left = pos[1] === 'l';
  const v = top ? 'top' : 'bottom';
  const h = left ? 'left' : 'right';
  const bracket = (offset: number, size: number, width: number) => ({
    position: 'absolute' as const,
    [v]: `${offset}px`,
    [h]: `${offset}px`,
    width: `${size}px`,
    height: `${size}px`,
    [`border${top ? 'Top' : 'Bottom'}`]: `${width}px solid ${C.gold}`,
    [`border${left ? 'Left' : 'Right'}`]: `${width}px solid ${C.gold}`,
  });
  return (
    <>
      <div style={bracket(44, 100, 3)} />
      <div style={bracket(54, 60, 1.5)} />
      <div style={{ position: 'absolute', [v]: '66px', [h]: '66px', width: '12px', height: '12px', background: C.gold, transform: 'rotate(45deg)' }} />
    </>
  );
};

const Signature = ({ src, name, title }: { src: string; name: string; title: string }) => (
  <div style={{ width: '270px', textAlign: 'center' }}>
    <div style={{ height: '80px', textAlign: 'center' }}>
      <img src={src} alt={`${name} signature`} style={{ maxHeight: '80px', maxWidth: '200px', display: 'inline-block' }} />
    </div>
    <div style={{ height: '1.5px', background: C.navy, margin: '6px 0 10px', opacity: 0.7 }} />
    <p style={{ margin: 0, fontFamily: F.display, fontSize: '17px', lineHeight: '22px', fontWeight: 700, color: C.navy, letterSpacing: '1px' }}>{name}</p>
    <p style={{ margin: '4px 0 0', fontSize: '11px', lineHeight: '16px', fontWeight: 600, color: C.goldDark, letterSpacing: '3px', textTransform: 'uppercase' }}>{title}</p>
  </div>
);

// "ANIKET  kailas BHOSALE" -> "Aniket Kailas Bhosale"; also capitalises after hyphens and apostrophes.
function toTitleCase(name: string) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

const NAME_MAX_WIDTH = 900;
const NAME_MAX_SIZE = 72;
const NAME_MIN_SIZE = 28;

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateProps>(({ participantName }, ref) => {
  // The 3Q assessment was held on a single day, so every certificate carries that date.
  const dateStr = '2 October 2026';
  const displayName = toTitleCase(participantName);
  const nameRef = useRef<HTMLSpanElement>(null);

  // Shrink the name until it fits the frame. Re-runs once the script font has loaded,
  // since fallback-font widths are different.
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const fit = () => {
      let size = NAME_MAX_SIZE;
      el.style.fontSize = `${size}px`;
      while (el.offsetWidth > NAME_MAX_WIDTH && size > NAME_MIN_SIZE) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
  }, [displayName]);

  return (
    <div
      ref={ref}
      style={{
        width: '1122px',
        height: '793px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily: '"Inter", sans-serif',
        color: C.ink,
        background: C.paper,
      }}
    >
      {/* Brand stripes */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: brandGradient }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: brandGradient }} />

      {/* Gold double frame */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: `3px solid ${C.gold}` }} />
      <div style={{ position: 'absolute', top: '33px', left: '33px', right: '33px', bottom: '33px', border: `1px solid ${C.gold}` }} />
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* Watermark */}
      <img
        src="/assets/ccubelogo.png"
        alt=""
        style={{ position: 'absolute', left: '381px', top: '210px', width: '360px', height: '360px', opacity: 0.06 }}
      />

      {/* Header logos */}
      <img src="/assets/vit-logo-transparent.png" alt="Vishwakarma Institute of Technology" style={{ position: 'absolute', top: '62px', left: '96px', height: '104px' }} />
      <img src="/assets/ccubelogo.png" alt="C Cube Club" style={{ position: 'absolute', top: '60px', right: '92px', width: '108px', height: '108px' }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: '62px', left: '220px', right: '220px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontFamily: F.display, fontSize: '64px', lineHeight: '72px', fontWeight: 700, letterSpacing: '9px', color: C.navy }}>
          CERTIFICATE
        </h1>
        <div style={{ marginTop: '8px', height: '26px', lineHeight: '26px' }}>
          <span style={{ display: 'inline-block', verticalAlign: 'middle', width: '64px', height: '2px', background: goldGradient }} />
          <span style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 16px', fontFamily: F.display, fontSize: '19px', fontWeight: 600, letterSpacing: '7px', color: C.goldDark }}>
            OF APPRECIATION
          </span>
          <span style={{ display: 'inline-block', verticalAlign: 'middle', width: '64px', height: '2px', background: goldGradient }} />
        </div>
      </div>

      {/* Recipient + citation */}
      <div style={{ position: 'absolute', top: '214px', left: '90px', right: '90px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '13px', lineHeight: '18px', fontWeight: 600, letterSpacing: '5px', color: C.muted, textTransform: 'uppercase' }}>
          This certificate is proudly presented to
        </p>
        <p style={{ margin: '6px 0 0', height: '100px', lineHeight: '100px', fontFamily: F.script, color: C.navy, whiteSpace: 'nowrap' }}>
          <span ref={nameRef} style={{ display: 'inline-block', fontSize: `${NAME_MAX_SIZE}px` }}>{displayName}</span>
        </p>

        <p style={{ margin: '24px auto 0', width: '820px', fontFamily: F.serif, fontSize: '21px', lineHeight: '32px', fontWeight: 500, color: C.ink }}>
          In recognition of successfully appearing for the <b style={{ color: C.navy }}>3Q Assessment Test</b>, evaluating{' '}
          <b style={{ color: C.green }}>Emotional Quotient (EQ)</b>,{' '}
          <b style={{ color: C.violet }}>Intelligence Quotient (IQ)</b> and{' '}
          <b style={{ color: C.crimson }}>Social Quotient (SQ)</b>, organised by the{' '}
          <b style={{ color: C.navy, whiteSpace: 'nowrap' }}>C Cube Club</b>, Vishwakarma Institute of Technology, Pune, on{' '}
          <span style={{ whiteSpace: 'nowrap' }}>{dateStr}</span>.
        </p>
      </div>

      {/* Signatures */}
      <div style={{ position: 'absolute', left: '110px', bottom: '62px' }}>
        <Signature src="/assets/signatures/sign-president.png" name="Atharv Jambhule" title="President, C Cube" />
      </div>
      <div style={{ position: 'absolute', right: '110px', bottom: '62px' }}>
        <Signature src="/assets/signatures/sign-faculty.png" name="Dr. Vijay Gaikwad" title="Faculty Coordinator" />
      </div>

      {/* Medal is a pre-rendered image: html2canvas shifts text vertically in some browsers. */}
      <img src="/assets/certificate-medal.png" alt="" style={{ position: 'absolute', left: '505px', bottom: '54px', width: '112px', height: '129px' }} />
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';
export default CertificateTemplate;
