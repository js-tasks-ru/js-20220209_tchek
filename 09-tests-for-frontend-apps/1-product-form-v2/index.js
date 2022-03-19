import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const IMAGE_UPLOAD_URL = 'https://api.imgur.com/3/image'

export default class ProductForm {
  defaultProduct = [{
    title: '',
    description: '',
    quantity: '',
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }]

  constructor(productId) {
    this.productId = productId;
    this.urlCat = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    this.urlProd = new URL('api/rest/products', BACKEND_URL);
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const [file] = fileInput.files;
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const { uploadImage, imageListContainer } = this.subElements;
      uploadImage.classList.add('is-loading');
      uploadImage.disabled = true;

      try {
        const result = await fetchJson(IMAGE_UPLOAD_URL, {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: '',
        })

        const newImage = { url: result.data.link, source: file.name };

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getPhotoLi(newImage);

        imageListContainer.firstElementChild.append(wrapper.firstElementChild);
      }
      catch (error) {
        alert(error.message);
      }
      finally {
        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;
      }

      fileInput.remove();
    }

    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  getPhotoLis(images) {
    return images.map((image) => this.getPhotoLi(image)).join('');
  }

  getPhotoLi(image) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value="${image.url}">
              <input type="hidden" name="source" value="${image.source}">
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                <span>${image.source}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
  }

  getSubcategories(categories) {
    return categories.map(category => {
      return this.getSubcategoriesInner(category.title, category.subcategories);
    }).join('');
  }

  getSubcategoriesInner(categoryName, subcategories) {
    return subcategories.map(subcategory => {
      return `<option value="${subcategory.id}">
          ${categoryName} > ${subcategory.title}</option>`;
    }).join('');
  }

  getTemplate(categories, product) {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        <ul class="sortable-list">
          ${this.getPhotoLis(product.images)}
        </ul>
      </div>
      <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage">
        <span>Загрузить</span>
      </button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
        ${this.getSubcategories(categories)}
       </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>`;
  }

  async loadData() {
    const categoryLoad = fetchJson(this.urlCat);
    let productLoad = Promise.resolve(this.defaultProduct);
    if (this.productId) {
      this.urlProd.searchParams.set('id', this.productId);
      productLoad = fetchJson(this.urlProd);
    }

    return Promise.all([categoryLoad, productLoad]);
  }

  async render() {
    let categories;
    let product;
    try {
      [categories, [product]] = await this.loadData();
    }
    catch {
      alert('Didn`t manage to load data');
      throw new Error('Not rendered');
    }
 
    const element = document.createElement('div');
    const template = this.getTemplate(categories, product);
    element.innerHTML = template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.controls = this.getControls();

    this.renderForm(product);
    const items = [];
    for (const image in product.images) {
      items.push(this.getPhotoLi(image));
    }

    const submitButton = this.element.querySelector("[name=save]");
    submitButton.addEventListener("pointerdown", this.submitClick);
    const loadImageButton = this.element.querySelector('[name=uploadImage]');
    loadImageButton.addEventListener("pointerdown", this.uploadImage);

    return this.element;
  }

  submitClick = async clickArgs => {
    clickArgs.preventDefault();
    await this.save();
  }

  async save() {
    const formData = this.collectFormData();
    debugger;
    try {
      await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      const eventType = this.productId ? "product-updated" : "product-saved";
      const event = new Event(eventType);
      this.element.dispatchEvent(event);

    }
    catch (error) {
      alert(error.message);
    }
  }

  collectFormData() {
    const object = new FormData();
    object.append('id', this.productId);

    const stringFields = ['description', 'subcategory', 'title'];

    for (const control of Object.keys(this.controls)) {
      object.append(control, stringFields.includes(control)
        ? this.controls[control].value
        : parseInt(this.controls[control].value));
    }

    const imagesHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.products-edit__imagelist-item');
    let images = []
    for (const li of imagesHTMLCollection) {
      images.push({
        url: li.querySelector('[name=url]').value,
        source: li.querySelector('[name=source]').value
      });
    }
    object.append('images', JSON.stringify(images));
    return object;
  }

  renderForm(product) {
    for (const controlName of Object.keys(this.controls)) {
      this.controls[controlName].value = product[controlName];
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getControls() {
    const result = {};
    const elements = this.element.querySelectorAll('.form-control');

    for (const control of elements) {
      const name = control.name;

      result[name] = control;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
