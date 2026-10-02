import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { kes, discountPct } from '../lib/format';
import { Icon } from './ui/Bits';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const pct = discountPct(product);
  const inStock = product.stock_qty > 0;
  const low = inStock && product.stock_qty <= 10;
  const sub = [product.strength, product.dosage_form, product.pack_size].filter(Boolean).join(' · ');

  return (
    <div className="card-dark lift group" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Link to={`/product/${product.id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden', aspectRatio: '4 / 3', background: 'rgba(255,255,255,.04)' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms ease' }} className="group-hover:scale-105" />
          : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'rgba(244,250,240,.25)' }}><Icon name="solar:pills-3-linear" size={56} /></div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,10,4,.62), transparent 55%)' }}></div>
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.requires_prescription && <span className="pill pill-rx"><Icon name="solar:document-medicine-linear" size={12} />Rx only</span>}
          {product.badge && <span className="pill" style={{ background: product.badge === 'Sale' ? 'rgba(239,68,68,.92)' : 'linear-gradient(135deg,#9FD96A,#4A8C2A)', color: product.badge === 'Sale' ? '#fff' : '#111A0C' }}>{product.badge}</span>}
          {!inStock && <span className="pill" style={{ background: 'rgba(30,42,21,.88)', color: 'rgba(244,250,240,.7)', border: '1px solid rgba(244,250,240,.14)' }}>Out of stock</span>}
        </div>
      </Link>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '.64rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6DB33F', marginBottom: '.35rem' }}>{product.generic_name || product.brand || ' '}</div>
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 hover:text-[#9FD96A] transition-colors" style={{ margin: '0 0 .35rem', fontSize: '.95rem', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3, color: 'var(--text-light)' }}>{product.name}</h3>
        </Link>
        <p style={{ margin: '0 0 .75rem', fontSize: '.74rem', color: 'rgba(244,250,240,.46)', lineHeight: 1.45 }}>{sub}</p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '.55rem', marginTop: 'auto', marginBottom: '.2rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-.04em' }}>{kes(product.price)}</span>
          {pct && <>
            <span style={{ fontSize: '.78rem', color: 'rgba(244,250,240,.38)', textDecoration: 'line-through' }}>{kes(product.compare_at_price)}</span>
            <span className="pill pill-green" style={{ padding: '.15rem .45rem' }}>-{pct}%</span>
          </>}
        </div>
        <div style={{ minHeight: 18, marginBottom: '.7rem', fontSize: '.7rem', color: '#FBBF24' }}>{low && `Only ${product.stock_qty} left`}</div>

        <button disabled={!inStock} onClick={() => dispatch({ type: 'ADD', product })}
          className={inStock ? 'btn-primary' : ''}
          style={inStock ? { width: '100%', padding: '.7rem' } : { width: '100%', padding: '.7rem', borderRadius: 999, border: 'none', background: 'rgba(244,250,240,.06)', color: 'rgba(244,250,240,.3)', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'not-allowed' }}>
          <Icon name="solar:cart-plus-linear" size={15} />{inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </div>
  );
}
