import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import customerApi from '../../api/customerAxios'
import toast from 'react-hot-toast'
import img3ply   from '../../assets/boxes/3ply_corrugated.webp'
import img5ply   from '../../assets/boxes/5ply_corrugated.webp'
import imgDieCut from '../../assets/boxes/die_cut_box.webp'
import imgMailer from '../../assets/boxes/mailer_box.jpg'

const BOX_TYPES = [
  {
    name:     'Corrugated 3-ply',
    desc:     'Perfect for standard e-commerce packaging and light retail items',
    price:    '₹8–12 / box',
    strength: 'Light duty',
    weight:   'Up to 10 kg',
    bestFor:  ['E-commerce', 'Retail', 'Gifts'],
    color:    '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    image:    img3ply,
    icon:     '📦',
  },
  {
    name:     'Corrugated 5-ply',
    desc:     'Heavy duty industrial packaging for fragile and heavy products',
    price:    '₹14–18 / box',
    strength: 'Heavy duty',
    weight:   'Up to 30 kg',
    bestFor:  ['Industrial', 'Electronics', 'Fragile items'],
    color:    '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    image:    img5ply,
    icon:     '🏗️',
  },
  {
    name:     'Die-cut box',
    desc:     'Custom shaped boxes perfect for branded retail packaging',
    price:    '₹10–15 / box',
    strength: 'Medium duty',
    weight:   'Up to 15 kg',
    bestFor:  ['Retail', 'Branding', 'Custom shapes'],
    color:    '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    image:    imgDieCut,
    icon:     '✂️',
  },
  {
    name:     'Mailer box',
    desc:     'Slim and stylish boxes ideal for subscription boxes and gifts',
    price:    '₹6–10 / box',
    strength: 'Light duty',
    weight:   'Up to 5 kg',
    bestFor:  ['Subscriptions', 'Gifts', 'Cosmetics'],
    color:    '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    image:    imgMailer,
    icon:     '💌',
  },
]

export default function PlaceOrder() {
  const navigate              = useNavigate()
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ box_type: '', quantity: '', due_date: '' })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const selectedBox = BOX_TYPES.find(b => b.name === form.box_type)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await customerApi.post('/customer/orders', {
        box_type: form.box_type,
        quantity: parseInt(form.quantity),
        due_date: form.due_date || null,
      })
      toast.success(`🎉 Order #${res.data.order_id} placed successfully!`)
      navigate('/customer/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={{
        ...styles.header,
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.5s ease',
      }}>
        <div>
          <h1 style={styles.title}>Place New Order</h1>
          <p style={styles.subtitle}>
            Choose your perfect box and we'll handle the rest
          </p>
        </div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} style={styles.backBtn}>
            ← Back
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div style={styles.stepRow}>
        {[
          { num: 1, label: 'Choose Box'    },
          { num: 2, label: 'Order Details' },
          { num: 3, label: 'Confirm'       },
        ].map((s, i) => (
          <div key={s.num} style={styles.stepItem}>
            <div style={{
              ...styles.stepCircle,
              background: step > s.num
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : step === s.num
                ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                : '#f1f5f9',
              color:     step >= s.num ? '#fff' : '#94a3b8',
              boxShadow: step === s.num ? '0 4px 12px rgba(29,78,216,0.4)' : 'none',
            }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{
              ...styles.stepLabel,
              color:      step === s.num ? '#1d4ed8' : step > s.num ? '#10b981' : '#94a3b8',
              fontWeight: step === s.num ? '600' : '400',
            }}>
              {s.label}
            </span>
            {i < 2 && (
              <div style={{
                ...styles.stepLine,
                backgroundColor: step > s.num ? '#10b981' : '#e2e8f0'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Box selection ── */}
      {step === 1 && (
        <div style={{
          ...styles.boxGrid,
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease 0.2s',
        }}>
          {BOX_TYPES.map((box, i) => (
            <div
              key={box.name}
              onClick={() => { setForm({ ...form, box_type: box.name }); setStep(2) }}
              onMouseEnter={() => setHovered(box.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.boxCard,
                transform:  hovered === box.name
                  ? 'translateY(-8px) scale(1.02)'
                  : 'translateY(0) scale(1)',
                boxShadow:  hovered === box.name
                  ? `0 24px 48px ${box.color}35`
                  : '0 2px 12px rgba(0,0,0,0.06)',
                border: form.box_type === box.name
                  ? `2px solid ${box.color}`
                  : '2px solid transparent',
                transition:      'all 0.3s ease',
                opacity:         mounted ? 1 : 0,
                transitionDelay: `${0.1 + i * 0.1}s`,
              }}
            >
              {/* Top color accent bar */}
              <div style={{
                ...styles.boxAccentBar,
                background: box.gradient,
              }} />

              {/* Box image */}
              <div style={styles.boxImageWrap}>
                <img
                  src={box.image}
                  alt={box.name}
                  style={styles.boxImage}
                />
                {/* Hover overlay */}
                {hovered === box.name && (
                  <div style={styles.boxHoverOverlay}>
                    <div style={{
                      ...styles.boxHoverBtn,
                      background: box.gradient,
                    }}>
                      Click to select →
                    </div>
                  </div>
                )}
              </div>

              {/* Box info */}
              <div style={styles.boxInfo}>
                {/* Name + icon */}
                <div style={styles.boxNameRow}>
                  <span style={styles.boxIcon}>{box.icon}</span>
                  <span style={styles.boxName}>{box.name}</span>
                </div>

                <div style={styles.boxDesc}>{box.desc}</div>

                {/* Meta */}
                <div style={styles.boxMeta}>
                  <div style={styles.boxMetaItem}>
                    <span style={styles.boxMetaLabel}>⚖️ Max weight</span>
                    <span style={styles.boxMetaValue}>{box.weight}</span>
                  </div>
                  <div style={styles.boxMetaItem}>
                    <span style={styles.boxMetaLabel}>💪 Strength</span>
                    <span style={{ ...styles.boxMetaValue, color: box.color }}>
                      {box.strength}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div style={styles.boxPriceRow}>
                  <span style={styles.boxPriceLabel}>Price range</span>
                  <span style={{ ...styles.boxPrice, color: box.color }}>
                    {box.price}
                  </span>
                </div>

                {/* Tags */}
                <div style={styles.boxTags}>
                  {box.bestFor.map(tag => (
                    <span key={tag} style={{
                      ...styles.boxTag,
                      backgroundColor: box.color + '15',
                      color:           box.color,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Select button */}
                <button style={{
                  ...styles.selectBtn,
                  background: hovered === box.name ? box.gradient : '#f8fafc',
                  color:      hovered === box.name ? '#fff'        : box.color,
                  border:     `1.5px solid ${box.color}40`,
                  transition: 'all 0.25s ease',
                }}>
                  {hovered === box.name ? `Select ${box.icon}` : 'Select this box'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 2: Order details ── */}
      {step === 2 && selectedBox && (
        <div style={styles.step2Layout}>

          {/* Selected box preview */}
          <div style={styles.previewCard}>
            <div style={{
              ...styles.previewAccent,
              background: selectedBox.gradient,
            }} />
            <div style={styles.previewImageWrap}>
              <img
                src={selectedBox.image}
                alt={selectedBox.name}
                style={styles.previewImage}
              />
              <div style={styles.previewSelectedBadge}>
                ✓ Selected
              </div>
            </div>
            <div style={styles.previewInfo}>
              <div style={styles.previewIconName}>
                <span style={styles.previewIcon}>{selectedBox.icon}</span>
                <span style={styles.previewName}>{selectedBox.name}</span>
              </div>
              <div style={styles.previewDesc}>{selectedBox.desc}</div>
              <div style={{ ...styles.previewPrice, color: selectedBox.color }}>
                {selectedBox.price}
              </div>
              <div style={styles.previewMeta}>
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Strength</span>
                  <span style={styles.previewMetaVal}>{selectedBox.strength}</span>
                </div>
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Max Weight</span>
                  <span style={styles.previewMetaVal}>{selectedBox.weight}</span>
                </div>
              </div>
              <div style={styles.previewTags}>
                {selectedBox.bestFor.map(tag => (
                  <span key={tag} style={{
                    ...styles.boxTag,
                    backgroundColor: selectedBox.color + '15',
                    color:           selectedBox.color,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                style={styles.changeBoxBtn}
              >
                ← Change box type
              </button>
            </div>
          </div>

          {/* Order form */}
          <div style={styles.detailCard}>
            <h3 style={styles.detailTitle}>Order Details</h3>
            <p style={styles.detailSub}>
              Fill in the quantity and delivery timeline
            </p>

            {/* Quantity */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Quantity (boxes)
                <span style={styles.labelHint}>Minimum 100 boxes</span>
              </label>
              <div style={styles.qtyWrap}>
                <button
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    quantity: Math.max(100, (parseInt(f.quantity) || 100) - 100)
                  }))}
                  style={styles.qtyBtn}
                >
                  −
                </button>
                <input
                  style={styles.qtyInput}
                  type="number"
                  min="100"
                  placeholder="1000"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    quantity: (parseInt(f.quantity) || 0) + 100
                  }))}
                  style={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              {/* Quick presets */}
              <div style={styles.qtyPresets}>
                <span style={styles.qtyPresetsLabel}>Quick select:</span>
                {[500, 1000, 2000, 5000, 10000].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setForm({ ...form, quantity: q })}
                    style={{
                      ...styles.qtyPreset,
                      backgroundColor: parseInt(form.quantity) === q
                        ? selectedBox.color : '#f1f5f9',
                      color: parseInt(form.quantity) === q ? '#fff' : '#64748b',
                      boxShadow: parseInt(form.quantity) === q
                        ? `0 2px 8px ${selectedBox.color}50` : 'none',
                    }}
                  >
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Required By
                <span style={styles.labelHint}>Optional</span>
              </label>
              <input
                style={styles.dateInput}
                type="date"
                value={form.due_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>

            {/* Live cost estimate */}
            {form.quantity >= 100 && (
              <div style={{
                ...styles.estimateBox,
                borderColor:     selectedBox.color + '40',
                backgroundColor: selectedBox.color + '08',
              }}>
                <div style={styles.estimateTop}>
                  <span style={styles.estimateLabel}>💰 Estimated Cost</span>
                  <span style={styles.estimateNote}>Final price after review</span>
                </div>
                <div style={{
                  ...styles.estimateValue,
                  color: selectedBox.color,
                }}>
                  ₹{(parseInt(form.quantity) * 8).toLocaleString()}
                  {' '}—{' '}
                  ₹{(parseInt(form.quantity) * 18).toLocaleString()}
                </div>
                <div style={styles.estimateBreakdown}>
                  <span>📦 {parseInt(form.quantity).toLocaleString()} boxes</span>
                  <span>×</span>
                  <span>{selectedBox.price}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => { if (parseInt(form.quantity) >= 100) setStep(3) }}
              disabled={!form.quantity || parseInt(form.quantity) < 100}
              style={{
                ...styles.nextBtn,
                background:  parseInt(form.quantity) >= 100
                  ? selectedBox.gradient : '#e2e8f0',
                color:       parseInt(form.quantity) >= 100 ? '#fff' : '#94a3b8',
                cursor:      parseInt(form.quantity) >= 100 ? 'pointer' : 'not-allowed',
                boxShadow:   parseInt(form.quantity) >= 100
                  ? `0 6px 20px ${selectedBox.color}45` : 'none',
              }}
            >
              Review Order →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && selectedBox && (
        <div style={styles.confirmLayout}>
          <div style={styles.confirmCard}>

            {/* Gradient header */}
            <div style={{
              ...styles.confirmHeader,
              background: selectedBox.gradient,
            }}>
              <div style={styles.confirmEmoji}>🎉</div>
              <div style={styles.confirmHeaderTitle}>Review Your Order</div>
              <div style={styles.confirmHeaderSub}>
                Please confirm everything looks correct
              </div>
            </div>

            <div style={styles.confirmBody}>

              {/* Box preview row */}
              <div style={styles.confirmPreviewRow}>
                <img
                  src={selectedBox.image}
                  alt={selectedBox.name}
                  style={styles.confirmImg}
                />
                <div style={styles.confirmPreviewInfo}>
                  <div style={styles.confirmBoxName}>
                    {selectedBox.icon} {selectedBox.name}
                  </div>
                  <div style={styles.confirmBoxDesc}>{selectedBox.desc}</div>
                  <div style={{
                    ...styles.confirmBoxPrice,
                    color: selectedBox.color
                  }}>
                    {selectedBox.price}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={styles.divider} />

              {/* Order summary */}
              <div style={styles.confirmSummary}>
                {[
                  { label: '📦 Box Type',   value: form.box_type },
                  { label: '🔢 Quantity',   value: `${parseInt(form.quantity).toLocaleString()} boxes` },
                  { label: '💰 Est. Cost',  value: `₹${(parseInt(form.quantity) * 8).toLocaleString()} – ₹${(parseInt(form.quantity) * 18).toLocaleString()}` },
                  {
                    label: '📅 Due Date',
                    value: form.due_date
                      ? new Date(form.due_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Not specified'
                  },
                  { label: '🏭 Initial Status', value: 'Pending → Production' },
                ].map(row => (
                  <div key={row.label} style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>{row.label}</span>
                    <span style={styles.confirmValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div style={styles.infoNote}>
                ℹ️ Your order will be reviewed by our production team and
                manufacturing will begin shortly. Track your order live from
                your dashboard.
              </div>

              {/* Action buttons */}
              <div style={styles.confirmBtns}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={styles.editBtn}
                >
                  ← Edit Order
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    ...styles.placeBtn,
                    background:  loading ? '#e2e8f0' : selectedBox.gradient,
                    boxShadow:   loading
                      ? 'none'
                      : `0 6px 20px ${selectedBox.color}45`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '⏳ Placing order...' : '✅ Confirm & Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page:     { padding: '28px', maxWidth: '1200px', backgroundColor: '#f0f9ff', minHeight: '100vh' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title:    { fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  backBtn:  { padding: '9px 18px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },

  // Steps
  stepRow:    { display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '0' },
  stepItem:   { display: 'flex', alignItems: 'center', gap: '8px' },
  stepCircle: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, transition: 'all 0.3s ease' },
  stepLabel:  { fontSize: '13px', transition: 'color 0.3s', whiteSpace: 'nowrap' },
  stepLine:   { width: '64px', height: '2px', margin: '0 8px', borderRadius: '1px', transition: 'background 0.3s' },

  // Step 1 — Box grid
  boxGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  boxCard:       { backgroundColor: '#fff', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer', position: 'relative' },
  boxAccentBar:  { height: '5px', width: '100%' },
  boxImageWrap:  { position: 'relative', height: '185px', backgroundColor: '#f5f0e8', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  boxImage:      { width: '100%', height: '100%', objectFit: 'contain', padding: '14px', transition: 'transform 0.4s ease' },
  boxHoverOverlay:{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' },
  boxHoverBtn:   { padding: '8px 18px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: '600', border: 'none' },
  boxInfo:       { padding: '16px' },
  boxNameRow:    { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
  boxIcon:       { fontSize: '18px' },
  boxName:       { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
  boxDesc:       { fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '12px' },
  boxMeta:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' },
  boxMetaItem:   { backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' },
  boxMetaLabel:  { fontSize: '10px', color: '#94a3b8' },
  boxMetaValue:  { fontSize: '12px', fontWeight: '600', color: '#1e293b' },
  boxPriceRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  boxPriceLabel: { fontSize: '11px', color: '#94a3b8' },
  boxPrice:      { fontSize: '14px', fontWeight: '700' },
  boxTags:       { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' },
  boxTag:        { fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' },
  selectBtn:     { width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },

  // Step 2
  step2Layout:       { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' },
  previewCard:       { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', alignSelf: 'start' },
  previewAccent:     { height: '5px' },
  previewImageWrap:  { position: 'relative', height: '200px', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewImage:      { width: '100%', height: '100%', objectFit: 'contain', padding: '16px' },
  previewSelectedBadge:{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  previewInfo:       { padding: '18px' },
  previewIconName:   { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  previewIcon:       { fontSize: '22px' },
  previewName:       { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  previewDesc:       { fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px' },
  previewPrice:      { fontSize: '16px', fontWeight: '700', marginBottom: '10px' },
  previewMeta:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' },
  previewMetaItem:   { backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px' },
  previewMetaLabel:  { display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' },
  previewMetaVal:    { fontSize: '12px', fontWeight: '600', color: '#1e293b' },
  previewTags:       { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' },
  changeBoxBtn:      { fontSize: '13px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' },
  detailCard:        { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  detailTitle:       { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  detailSub:         { fontSize: '13px', color: '#94a3b8', marginBottom: '24px' },
  fieldGroup:        { marginBottom: '22px' },
  label:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  labelHint:         { fontSize: '11px', color: '#94a3b8', fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  qtyWrap:           { display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
  qtyBtn:            { width: '48px', border: 'none', backgroundColor: '#f8fafc', color: '#1e293b', fontSize: '22px', fontWeight: '400', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' },
  qtyInput:          { flex: 1, padding: '12px', border: 'none', fontSize: '20px', fontWeight: '700', textAlign: 'center', outline: 'none', backgroundColor: '#fff' },
  qtyPresets:        { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  qtyPresetsLabel:   { fontSize: '11px', color: '#94a3b8', marginRight: '2px' },
  qtyPreset:         { padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  dateInput:         { width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' },
  estimateBox:       { padding: '16px', borderRadius: '12px', border: '1.5px solid', marginBottom: '20px' },
  estimateTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  estimateLabel:     { fontSize: '12px', fontWeight: '600', color: '#374151' },
  estimateNote:      { fontSize: '11px', color: '#94a3b8' },
  estimateValue:     { fontSize: '24px', fontWeight: '800', marginBottom: '6px' },
  estimateBreakdown: { display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8' },
  nextBtn:           { width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', transition: 'all 0.2s' },

  // Step 3
  confirmLayout:     { maxWidth: '580px', margin: '0 auto' },
  confirmCard:       { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  confirmHeader:     { padding: '36px', textAlign: 'center', color: '#fff' },
  confirmEmoji:      { fontSize: '52px', marginBottom: '12px' },
  confirmHeaderTitle:{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' },
  confirmHeaderSub:  { fontSize: '14px', opacity: 0.85 },
  confirmBody:       { padding: '28px' },
  confirmPreviewRow: { display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px' },
  confirmImg:        { width: '90px', height: '68px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f5f0e8', padding: '6px', flexShrink: 0 },
  confirmPreviewInfo:{ flex: 1 },
  confirmBoxName:    { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  confirmBoxDesc:    { fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  confirmBoxPrice:   { fontSize: '14px', fontWeight: '600' },
  divider:           { height: '1px', backgroundColor: '#f1f5f9', margin: '0 0 16px 0' },
  confirmSummary:    { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  confirmRow:        { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc', fontSize: '14px' },
  confirmLabel:      { color: '#64748b' },
  confirmValue:      { fontWeight: '600', color: '#1e293b', textAlign: 'right', maxWidth: '55%' },
  infoNote:          { fontSize: '13px', color: '#475569', backgroundColor: '#f0f9ff', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', lineHeight: '1.6', border: '1px solid #dbeafe' },
  confirmBtns:       { display: 'flex', gap: '10px' },
  editBtn:           { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  placeBtn:          { flex: 2, padding: '12px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s' },
}