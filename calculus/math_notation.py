"""Native MathML for the key equations; no downloaded renderer or fonts."""
from html import escape

def tag(name, *parts, **attrs):
    at = ''.join(f' {k}="{escape(str(v), quote=True)}"' for k, v in attrs.items())
    return f'<{name}{at}>' + ''.join(parts) + f'</{name}>'

def v(s): return tag('mi', escape(str(s)))
def n(s): return tag('mn', escape(str(s)))
def op(s): return tag('mo', escape(s))
def row(*s): return tag('mrow', *s)
def text(s): return tag('mtext', escape(s))
def frac(a,b): return tag('mfrac',a,b)
def sup(a,b): return tag('msup',a,b)
def sub(a,b): return tag('msub',a,b)
def root(a): return tag('msqrt',a)
def par(a): return row(op('('),a,op(')'))
def absval(a): return row(op('|'),a,op('|'))
def vec(*a): return row(op('⟨'),op(',').join(a),op('⟩'))
def total(body,low='n=1',high='∞'): return row(tag('munderover',op('∑'),text(low),text(high)),body)
def integ(body,a,b): return row(tag('msubsup',op('∫'),text(a),text(b)),body)

x,y,z,t,k,a,b,c,L,R,M = map(v,['x','y','z','t','k','a','b','c','L','R','M'])
nn=v('n'); an=sub(a,nn); sn=sub(v('S'),nn)
dx=row(v('d'),x);dy=row(v('d'),y)
dydx=frac(dy,dx)
fx=sub(v('f'),x);fy=sub(v('f'),y)
grad=row(op('∇'),v('f'))
power=sup(par(row(x,op('−'),a)),nn)
factorial=row(nn,op('!'))
FORMULAS={
'sequences':([row(an,op('='),frac(row(n(3),nn,op('+'),n(2)),row(nn,op('+'),n(1))),op('='),n(3),op('−'),frac(n(1),row(nn,op('+'),n(1))),op('→'),n(3))], 'A limit describes the tail of a sequence, not an eventual exact value.'),
'partial-sums':([row(sn,op('='),total(sub(a,k),'k=1','n')),row(total(an),op('='),L)], 'The infinite sum exists when the sequence of finite partial sums has a finite limit L.'),
'positive-tests':([total(frac(n(1),sup(nn,v('p'))))], 'The p-series converges for p > 1 and diverges for p ≤ 1.'),
'ratio-root':([row(L,op('='),tag('munder',op('lim'),text('n → ∞')),absval(frac(sub(a,row(nn,op('+'),n(1))),an))),row(L,op('='),tag('munder',op('lim'),text('n → ∞')),tag('mroot',absval(an),nn))], 'If the displayed limit exists: L < 1 gives absolute convergence; L > 1 gives divergence; L = 1 is inconclusive.'),
'alternating':([row(absval(row(v('S'),op('−'),sn)),op('≤'),sub(b,row(nn,op('+'),n(1))))], 'Alternating-series error bound: positive magnitudes decrease to zero; Sₙ includes the first n terms.'),
'power':([row(total(frac(sup(par(row(x,op('−'),n(2))),nn),nn)),text('   '),R,op('='),n(1)),row(n(1),op('≤'),x,op('<'),n(3))], 'The interval is [1, 3): check the two endpoints separately.'),
'taylor':([row(sub(v('T'),nn),par(x),op('='),total(row(frac(row(sup(v('f'),par(k)),par(a)),row(k,op('!'))),sup(par(row(x,op('−'),a)),k)),'k=0','n')),row(absval(sub(R,nn)),op('≤'),frac(row(M,sup(absval(row(x,op('−'),a)),row(nn,op('+'),n(1)))),row(par(row(nn,op('+'),n(1))),op('!'))))], 'For the error bound, |f⁽ⁿ⁺¹⁾| ≤ M on the interval between the center a and the evaluation point x.'),
'series-tools':([row(frac(n(1),row(n(1),op('−'),x)),op('='),total(sup(x,nn),'n=0')),row(v('ln'),par(row(n(1),op('+'),x)),op('='),total(frac(row(sup(par(n(-1)),row(nn,op('+'),n(1))),sup(x,nn)),nn)))], 'The geometric identity holds for |x| < 1. The logarithm series holds for −1 < x ≤ 1.'),
'parametric':([row(dydx,op('='),frac(row(v('y′'),par(t)),row(v('x′'),par(t)))),row(frac(row(sup(v('d'),n(2)),y),row(v('d'),sup(x,n(2)))),op('='),frac(row(frac(v('d'),row(v('d'),t)),par(dydx)),row(v('x′'),par(t))))], 'Divide by x′(t) only where it is nonzero. If both coordinate rates vanish, investigate separately.'),
'polar':([row(x,op('='),v('r'),v('cos'),v('θ'),op(','),y,op('='),v('r'),v('sin'),v('θ')),row(v('A'),op('='),frac(n(1),n(2)),integ(row(sup(row(v('r'),par(v('θ'))),n(2)),v('d'),v('θ')),'a','b'))], 'Choose angle bounds that sweep the intended region once.'),
'vector-basics':([row(absval(v('v')),op('='),root(row(sup(sub(v('v'),n(1)),n(2)),op('+'),sup(sub(v('v'),n(2)),n(2)),op('+'),sup(sub(v('v'),n(3)),n(2))))),row(v('u'),op('='),frac(v('v'),absval(v('v'))))], 'The unit direction v/|v| is defined only for nonzero v.'),
'dot-cross':([row(v('u'),op('·'),v('v'),op('='),absval(v('u')),absval(v('v')),v('cos'),v('θ')),row(absval(row(v('u'),op('×'),v('v'))),op('='),absval(v('u')),absval(v('v')),v('sin'),v('θ')),row(sub(v('proj'),v('u')),v('v'),op('='),frac(row(v('v'),op('·'),v('u')),row(v('u'),op('·'),v('u'))),v('u'))], 'The dot product is a scalar; the cross product is a vector. Projection requires u ≠ 0.'),
'lines-planes':([row(v('r'),par(t),op('='),v('p'),op('+'),t,v('v')),row(v('n'),op('·'),par(row(v('r'),op('−'),sub(v('p'),n(0)))),op('='),n(0))], 'A line uses a direction v. A plane uses a nonzero normal n.'),
'vectors-preview':([row(v('r'),par(t),op('='),vec(row(v('cos'),t),row(v('sin'),t),t)),row(v('v'),par(t),op('='),vec(row(op('−'),v('sin'),t),row(v('cos'),t),n(1))),row(absval(row(v('v'),par(t))),op('='),root(n(2)))], 'Differentiate components to obtain velocity; its magnitude is speed.'),
'arc-curvature':([row(L,op('='),integ(row(absval(row(v('r′'),par(t))),v('d'),t),'a','b')),row(v('κ'),op('='),frac(absval(row(v('r′'),op('×'),v('r″'))),sup(absval(v('r′')),n(3))))], 'The curvature formula requires a regular twice-differentiable curve: r′ ≠ 0.'),
'surfaces':([row(v('f'),par(row(x,op(','),y)),op('='),c),row(v('f'),par(row(x,op(','),y)),op('='),sup(x,n(2)),op('+'),n(4),sup(y,n(2)))], 'A level curve consists of the points with one fixed height c.'),
'multivariable-limits':([row(tag('munder',op('lim'),text('(x,y) → (0,0)')),frac(row(x,y),row(sup(x,n(2)),op('+'),sup(y,n(2)))))] , 'This limit fails: y = 0 gives 0, whereas y = x gives 1/2. Two agreeing paths would not prove existence.'),
'partials-preview':([row(v('f'),par(row(x,op(','),y)),op('='),sup(x,n(2)),op('+'),x,y,op('+'),sup(y,n(2))),row(fx,op('='),n(2),x,op('+'),y,op(','),fy,op('='),x,op('+'),n(2),y),row(grad,op('='),vec(fx,fy))], 'For each partial derivative, hold the other independent variable fixed.'),
'tangent-plane':([row(L,par(row(x,op(','),y)),op('='),v('f'),par(row(a,op(','),b)),op('+'),fx,par(row(a,op(','),b)),par(row(x,op('−'),a)),op('+'),fy,par(row(a,op(','),b)),par(row(y,op('−'),b)))], 'Linearization requires differentiability at the center (a, b). It predicts nearby values.'),
'chain-rule':([row(frac(row(v('d'),z),row(v('d'),t)),op('='),fx,frac(dx,row(v('d'),t)),op('+'),fy,frac(dy,row(v('d'),t)))], 'Evaluate the partials along (x(t), y(t)); include every changing input.'),
'gradient':([row(sub(v('D'),v('u')),v('f'),op('='),grad,op('·'),v('u')),row(text('maximum rate'),op('='),absval(grad))], 'Use a unit direction u and a differentiable function. If ∇f = 0, there is no unique first-order ascent direction.'),
'optimization':([row(v('D'),op('='),sub(v('f'),text('xx')),sub(v('f'),text('yy')),op('−'),sup(sub(v('f'),text('xy')),n(2)))], 'At a smooth critical point: D > 0 gives a min if fₓₓ > 0, a max if fₓₓ < 0; D < 0 gives a saddle; D = 0 is inconclusive.'),
'lagrange':([row(grad,op('='),v('λ'),op('∇'),v('g')),row(v('g'),par(row(x,op(','),y)),op('='),c)], 'For a regular equality constraint, ∇g ≠ 0. Include the constraint and compare all candidates; singular points need separate checks.'),
}

def enrich(lessons):
    assert set(FORMULAS).issubset({l['id'] for l in lessons})
    for lesson in lessons:
        if lesson['id'] not in FORMULAS:
            assert lesson.get('formulaMathML', '').startswith('<math'), lesson['id']
            continue
        expressions, note = FORMULAS[lesson['id']]
        lesson['formulaMathML'] = ''.join(tag('math', expr, xmlns='http://www.w3.org/1998/Math/MathML', display='block') for expr in expressions)
        lesson['formulaNote'] = note
    return lessons
