import { ProductCard as Container } from './product-card';
import { ProductCardImage } from './product-image';
import { ProductCardTitle } from './product-title';
import { ProductCardPrice } from './product-price';
import { ProductCardRating } from './product-rating';
import { ProductCardBadges } from './product-badges';
import { ProductCardActions } from './product-actions';

export const ProductCard = Object.assign(Container, {
  Image: ProductCardImage,
  Title: ProductCardTitle,
  Price: ProductCardPrice,
  Rating: ProductCardRating,
  Badges: ProductCardBadges,
  Actions: ProductCardActions,
});

export { useProductCard } from './product-card';
export type { CatalogProduct } from './product-card';
export default ProductCard;
