"""
numerical_methods.py
Modul implementasi 3 metode pencarian akar dalam analisis numerik:
1. Metode Tabel (Incremental Search)
2. Metode Bagi Dua (Bisection)
3. Metode Newton-Raphson
"""

import math
from typing import Dict, Any, List, Optional

SAFE_MATH_ENV = {
    'sin': math.sin,
    'cos': math.cos,
    'tan': math.tan,
    'asin': math.asin,
    'acos': math.acos,
    'atan': math.atan,
    'sinh': math.sinh,
    'cosh': math.cosh,
    'tanh': math.tanh,
    'exp': math.exp,
    'log': math.log,
    'log10': math.log10,
    'sqrt': math.sqrt,
    'abs': abs,
    'pi': math.pi,
    'e': math.e,
    'pow': pow,
}


def sanitize_expression(expr: str) -> str:
    """Mengubah sintaks matematika umum ke sintaks Python yang valid."""
    expr = expr.strip()
    expr = expr.replace('^', '**')
    return expr


def evaluate_f(expr: str, x: float) -> float:
    """Evaluasi fungsi f(x) secara aman."""
    sanitized = sanitize_expression(expr)
    try:
        code = compile(sanitized, "<string>", "eval")
        scope = SAFE_MATH_ENV.copy()
        scope['x'] = float(x)
        val = eval(code, {"__builtins__": {}}, scope)
        val = float(val)
        if math.isnan(val) or math.isinf(val):
            raise ValueError(f"Hasil f({x:.3f}) tidak terdefinisi (NaN atau Tak Hingga).")
        return val
    except ZeroDivisionError:
        raise ValueError(f"Terjadi pembagian dengan nol pada saat mengevaluasi f({x:.3f}).")
    except Exception as e:
        raise ValueError(f"Gagal mengevaluasi fungsi pada x={x:.3f}: {str(e)}")


def evaluate_df(expr: str, d_expr: Optional[str], x: float, h: float = 1e-5) -> float:
    """Evaluasi turunan f'(x). Jika d_expr tidak ada, gunakan selisih pusat (central difference)."""
    if d_expr and d_expr.strip():
        return evaluate_f(d_expr, x)
    f_plus = evaluate_f(expr, x + h)
    f_minus = evaluate_f(expr, x - h)
    return (f_plus - f_minus) / (2.0 * h)


def generate_plot_data(expr: str, x_min: float, x_max: float, num_points: int = 100) -> List[Dict[str, float]]:
    """Membuat titik-titik kurva untuk divisualisasikan pada grafik."""
    points = []
    if x_max <= x_min:
        x_min, x_max = x_min - 2, x_max + 2

    step = (x_max - x_min) / max(num_points, 10)
    for i in range(num_points + 1):
        x = x_min + i * step
        try:
            y = evaluate_f(expr, x)
            if abs(y) < 1e6:
                points.append({"x": round(x, 3), "y": round(y, 3)})
            else:
                points.append({"x": round(x, 3), "y": None})
        except Exception:
            points.append({"x": round(x, 3), "y": None})
    return points


def metode_tabel(func_str: str, a: float, b: float, n: int = 10) -> Dict[str, Any]:
    """Simulasi Metode Tabel (Incremental Search Method)."""
    if n < 1:
        raise ValueError("Jumlah partisi (N) minimal harus 1.")
    if b <= a:
        raise ValueError("Batas atas (b) harus lebih besar dari batas bawah (a).")

    h = (b - a) / n
    table = []
    sign_changes = []
    min_abs_fx = float('inf')
    best_idx = 0

    for i in range(n + 1):
        xi = a + (i * h)
        fxi = evaluate_f(func_str, xi)
        abs_fx = abs(fxi)

        if abs_fx < min_abs_fx:
            min_abs_fx = abs_fx
            best_idx = i

        row = {
            "iterasi": i,
            "x": round(xi, 3),
            "fx": round(fxi, 3),
            "sign_change": False,
            "is_best": False,
            "keterangan": "-"
        }
        table.append(row)

        if i > 0:
            prev_fx = table[i - 1]["fx"]
            if (prev_fx * fxi) <= 0:
                table[i - 1]["sign_change"] = True
                table[i]["sign_change"] = True
                x_prev = table[i - 1]["x"]
                sign_changes.append((x_prev, row["x"]))
                table[i]["keterangan"] = f"Akar di antara [{x_prev:.3f}, {row['x']:.3f}]"

    table[best_idx]["is_best"] = True
    if table[best_idx]["keterangan"] == "-":
        table[best_idx]["keterangan"] = "Aproksimasi terbaik (|f(x)| minimum)"
    else:
        table[best_idx]["keterangan"] += " & |f(x)| terdekat ke nol"

    akar_taksiran = table[best_idx]["x"]
    akar_fx = table[best_idx]["fx"]

    padding = (b - a) * 0.15
    plot_points = generate_plot_data(func_str, a - padding, b + padding)

    return {
        "status": "success",
        "metode": "Metode Tabel",
        "fungsi": func_str,
        "a": round(a, 3),
        "b": round(b, 3),
        "h": round(h, 3),
        "n": n,
        "akar": round(akar_taksiran, 3),
        "fx_akar": round(akar_fx, 3),
        "sign_changes": sign_changes,
        "table": table,
        "plot_points": plot_points,
    }


def metode_bisection(func_str: str, a: float, b: float, tol: float = 0.001, max_iter: int = 50) -> Dict[str, Any]:
    """Simulasi Metode Bagi Dua (Bisection Method)."""
    if b <= a:
        raise ValueError("Batas atas (b) harus lebih besar dari batas bawah (a).")
    if tol <= 0:
        raise ValueError("Toleransi error harus bernilai positif.")
    if max_iter < 1:
        raise ValueError("Maksimum iterasi minimal 1.")

    fa = evaluate_f(func_str, a)
    fb = evaluate_f(func_str, b)

    if fa * fb > 0:
        raise ValueError(
            f"f(a) = {fa:.3f} dan f(b) = {fb:.3f} memiliki tanda yang sama (f(a) × f(b) > 0). "
            f"Metode Bagi Dua mensyaratkan f(a) dan f(b) berlawanan tanda agar dapat menjepit akar."
        )

    table = []
    converged = False
    c = (a + b) / 2.0
    fc = evaluate_f(func_str, c)
    root_history = []

    current_a = a
    current_b = b
    current_fa = fa
    current_fb = fb

    for i in range(1, max_iter + 1):
        c = (current_a + current_b) / 2.0
        fc = evaluate_f(func_str, c)
        error = abs(current_b - current_a)
        root_history.append({"iterasi": i, "x": round(c, 3), "y": round(fc, 3)})

        table.append({
            "iterasi": i,
            "a": round(current_a, 3),
            "b": round(current_b, 3),
            "c": round(c, 3),
            "fa": round(current_fa, 3),
            "fb": round(current_fb, 3),
            "fc": round(fc, 3),
            "error": round(error, 3)
        })

        if error < tol or abs(fc) < 1e-6:
            converged = True
            break

        if current_fa * fc < 0:
            current_b = c
            current_fb = fc
        else:
            current_a = c
            current_fa = fc

    domain_min = min(a, b) - abs(b - a) * 0.2
    domain_max = max(a, b) + abs(b - a) * 0.2
    plot_points = generate_plot_data(func_str, domain_min, domain_max)

    return {
        "status": "success",
        "metode": "Metode Bagi Dua (Bisection)",
        "fungsi": func_str,
        "a_awal": round(a, 3),
        "b_awal": round(b, 3),
        "akar": round(c, 3),
        "fx_akar": round(fc, 3),
        "total_iterasi": len(table),
        "converged": converged,
        "toleransi": round(tol, 3),
        "table": table,
        "plot_points": plot_points,
        "root_history": root_history
    }


def metode_newton_raphson(
    func_str: str,
    dfunc_str: Optional[str],
    x0: float,
    tol: float = 0.001,
    max_iter: int = 50
) -> Dict[str, Any]:
    """Simulasi Metode Newton-Raphson."""
    if tol <= 0:
        raise ValueError("Toleransi error harus bernilai positif.")
    if max_iter < 1:
        raise ValueError("Maksimum iterasi minimal 1.")

    table = []
    xr = float(x0)
    converged = False
    root_history = []

    for i in range(1, max_iter + 1):
        fxr = evaluate_f(func_str, xr)
        dfxr = evaluate_df(func_str, dfunc_str, xr)

        root_history.append({"iterasi": i, "x": round(xr, 3), "y": round(fxr, 3)})

        if abs(dfxr) < 1e-12:
            raise ValueError(
                f"Turunan f'({xr:.3f}) = {dfxr:.3f} mendekati nol pada iterasi {i}. "
                f"Garis singgung horizontal membuat pembagian nol sehingga metode divergen."
            )

        xr1 = xr - (fxr / dfxr)
        error = abs(xr1 - xr)

        table.append({
            "iterasi": i,
            "xr": round(xr, 3),
            "fxr": round(fxr, 3),
            "dfxr": round(dfxr, 3),
            "xr1": round(xr1, 3),
            "error": round(error, 3)
        })

        if error < tol or abs(evaluate_f(func_str, xr1)) < 1e-6:
            converged = True
            xr = xr1
            root_history.append({"iterasi": i + 1, "x": round(xr, 3), "y": round(evaluate_f(func_str, xr), 3)})
            break

        xr = xr1

    fx_final = evaluate_f(func_str, xr)

    all_x = [row["xr"] for row in table] + [xr]
    min_x = min(all_x)
    max_x = max(all_x)
    span = max(abs(max_x - min_x), 2.0)
    plot_points = generate_plot_data(func_str, min_x - span * 0.3, max_x + span * 0.3)

    return {
        "status": "success",
        "metode": "Metode Newton-Raphson",
        "fungsi": func_str,
        "turunan": dfunc_str.strip() if dfunc_str else "Numerik (Central Difference)",
        "x0": round(x0, 3),
        "akar": round(xr, 3),
        "fx_akar": round(fx_final, 3),
        "total_iterasi": len(table),
        "converged": converged,
        "toleransi": round(tol, 3),
        "table": table,
        "plot_points": plot_points,
        "root_history": root_history
    }
