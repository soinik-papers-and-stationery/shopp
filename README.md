# Shoinik Paper & Stationeries 🖊️📒

**সৈনিক পেপার এন্ড স্টেশনারিজ**

A complete, professional, commercial website for a stationery shop in Bogra, Bangladesh. Built with pure HTML5, CSS3, Bootstrap 5, and vanilla JavaScript — no backend, no database required.

🔗 **Owner:** Torikul Islam
📞 **Phone:** 01724-389919
💬 **WhatsApp:** +880 1724-389919

---

## ✨ Features

- Fully responsive, mobile-first design
- Dark mode / Light mode toggle (saved across visits)
- Live product search with dropdown suggestions
- Shopping cart with localStorage persistence
- WhatsApp-based order checkout (no payment gateway needed)
- Product filtering by category, price, and search
- Image gallery with lightbox
- FAQ accordion
- Scroll animations and smooth page transitions
- SEO optimized (meta tags, Open Graph, Schema.org, sitemap)
- Floating WhatsApp button & back-to-top button
- Fully accessible (ARIA labels, keyboard navigation)

---

## 📁 Project Structure

```
Shoinik-Paper-Stationeries/
├── index.html              # Homepage
├── about.html               # About us page
├── products.html             # All products with filters
├── offers.html                # Current discounts & offers
├── gallery.html                # Photo gallery with lightbox
├── faq.html                     # FAQ accordion page
├── contact.html                  # Contact form + map
├── order.html                     # Checkout / WhatsApp order page
├── privacy.html                    # Privacy policy
├── terms.html                       # Terms & conditions
├── 404.html                          # Custom error page
├── robots.txt
├── sitemap.xml
├── manifest.json
├── README.md
└── assets/
    ├── css/
    │   ├── style.css          # Main styles
    │   ├── responsive.css      # Media queries
    │   └── animations.css       # Keyframe animations
    ├── js/
    │   ├── main.js             # Navbar, scroll, loader, toast, utils
    │   ├── theme.js              # Dark/light mode manager
    │   ├── cart.js                 # Shopping cart logic
    │   ├── products.js              # Product rendering & filtering
    │   ├── search.js                  # Live search dropdown
    │   └── order.js                    # WhatsApp order builder
    ├── images/
    │   ├── logo/                # Shop logo
    │   ├── hero/                 # Hero illustration
    │   ├── products/               # Product images (SVG)
    │   ├── gallery/                  # Gallery images
    │   └── brands/                     # Brand logos
    ├── icons/
    ├── fonts/
    └── data/
        ├── products.json         # ⭐ Product catalog (edit this!)
        ├── categories.json        # Product categories
        ├── reviews.json            # Customer reviews
        └── offers.json               # Active offers/discounts
```

---

## 🛠️ How to Edit Products (No Coding Required!)

All products are stored in **`assets/data/products.json`**. To add, remove, or edit a product, simply edit this JSON file — the website updates automatically, no code changes needed.

### Example product entry:
```json
{
  "id": 13,
  "name": "Your Product Name",
  "nameBn": "পণ্যের নাম",
  "category": "pens",
  "subcategory": "ball-pens",
  "price": 100,
  "originalPrice": 120,
  "stock": 50,
  "unit": "piece",
  "brand": "Brand Name",
  "description": "Short product description in English.",
  "descriptionBn": "বাংলায় সংক্ষিপ্ত বিবরণ।",
  "image": "assets/images/products/your-image.svg",
  "tags": ["tag1", "tag2"],
  "rating": 4.5,
  "reviews": 10,
  "isNew": true,
  "isFeatured": false,
  "isOffer": true
}
```

**Important fields:**
- `id` — must be unique (increment from the last product)
- `category` — must match an `id` value from `categories.json`
- `image` — path to product image (SVG, PNG, or JPG)
- `isNew` / `isFeatured` / `isOffer` — control where the product appears (homepage, offers page)

To add a new **category**, edit `assets/data/categories.json` following the same pattern.

---

## 🖼️ How to Change the Logo

1. Replace `assets/images/logo/logo.svg` with your own logo file (keep the same filename, or update references in HTML).
2. Update the favicon at `assets/favicon.svg`.
3. If using a raster image (PNG/JPG) instead of SVG, update the `<link rel="icon">` tag in each HTML file's `<head>` section accordingly.

---

## 🏪 How to Change Owner / Shop Info

Search and replace the following across all HTML files (and `assets/js/cart.js`, `assets/js/order.js` for the WhatsApp number):

| Item | Where to find/edit |
|---|---|
| Shop Name | `<title>` tags, navbar brand, footer |
| Owner Name | Footer, about.html |
| Phone Number | `tel:` links throughout, all pages |
| WhatsApp Number | `wa.me/` links, `assets/js/cart.js`, `assets/js/order.js` (search `WHATSAPP_NUMBER`) |
| Address | Footer, contact.html |
| Google Map | `<iframe src="...">` in index.html and contact.html |
| Business Hours | Footer, contact.html |

💡 **Tip:** Use your code editor's "Find & Replace in Files" feature to update the phone number `01724389919` across the entire project at once.

---

## 🚀 Deployment Guide

This is a 100% static site — no build step, no server required. Deploy it anywhere that serves static files.

### Deploy to GitHub Pages

1. Create a new repository on GitHub and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. Go to your repository → **Settings** → **Pages**.
3. Under "Source," select the `main` branch and `/ (root)` folder.
4. Click **Save**. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/` within a few minutes.

### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in.
2. Click **Add new site → Deploy manually**, then drag and drop the project folder.
   - OR connect your GitHub repository for continuous deployment.
3. Netlify will auto-detect this as a static site — no build settings needed.
4. Your site goes live instantly at a `*.netlify.app` URL (you can add a custom domain later).

### Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**, then import your GitHub repository (or drag-and-drop the folder using the Vercel CLI).
3. Framework Preset: choose **Other** (no build command needed).
4. Click **Deploy**. Vercel will host your static site automatically.

---

## ⚙️ Performance & SEO Notes

- All images use `loading="lazy"` and a fade-in effect for fast perceived performance.
- Meta tags, Open Graph, Twitter Card, and Schema.org markup are included on every page for better search visibility.
- `robots.txt` and `sitemap.xml` are pre-configured — update the domain (`shoinikpaper.com`) to your actual domain after deployment.
- No external JavaScript frameworks are used beyond Bootstrap 5 — keeping the site fast and lightweight.

---

## 🔒 Security Notes

- No inline JavaScript is used (all scripts are in external `.js` files).
- All user-generated content (search queries, form inputs) is sanitized via `sanitizeHTML()` before rendering to prevent XSS.
- Phone numbers and form inputs are validated client-side before submission.

---

## 📞 Need Help?

For support with this website template, contact the shop directly:
- **Phone:** 01724-389919
- **WhatsApp:** [wa.me/8801724389919](https://wa.me/8801724389919)

---

© 2025 Shoinik Paper & Stationeries. All rights reserved.
