import React, { useEffect } from 'react';

// import Image from "next/image";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./store.module.scss";
import { getStorePage } from '../utils/api';

export default function Store({ content }) {
  console.log(content);
  let store;
  console.log(content);
  if (true) {
    store = (<div>
        <div className={styles.storeHeader} style={{backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL + content.store.StoreHeader.Background.url})`}}>
          <div className={styles.storeHeaderLeft}>
            <h1>{content.store.StoreHeader.Title}</h1>
            <p>{content.store.StoreHeader.SubTitle}</p>
          </div>
        </div>
        <div id='collection-component-e337ddf74c4'></div>
    </div>);
  }
  else {
    store = (<div>
      <p className={styles.noAccess}>You must own a Gimmick to access this page.</p>
    </div>);
  }

  useEffect(() => {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    var node = document.getElementById('collection-component-e337ddf74c4');

    if (!node) return;

    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        ShopifyBuyInit();
      } else {
        loadScript();
      }
    } else {
      loadScript();
    }

    function loadScript() {
      var script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      script.onload = ShopifyBuyInit;
    }

    function ShopifyBuyInit() {
      var client = ShopifyBuy.buildClient({
        domain: 'billigfitness-headlinenav.myshopify.com',
        apiKey: '68e637063dea6d441cc0a6fb792eb530',
        appId: '6',
      });

      ShopifyBuy.UI.onReady(client).then(function (ui) {
        ui.createComponent('collection', {
          id: 448103748,
          node: document.getElementById('collection-component-e337ddf74c4'),
          options: {
            "product": {
              "buttonDestination": "modal",
              "variantId": "all",
              "isButton": true,
              "contents": {
                "imgWithCarousel": false,
                "variantTitle": false,
                "description": false,
                "buttonWithQuantity": false,
                "quantity": false,
                "options": false,
                "button": false,
              },
              "googleFonts": [
                "Rubik",
              ],
              "templates": {
                "img": '{{#data.currentImage.srcLarge}}<div class="{{data.classes.product.imgWrapper}}" data-element="product.imgWrapper"><img alt="{{data.currentImage.altText}}" data-element="product.img" class="{{data.classes.product.img}}" src="{{data.currentImage.srcLarge}}" /><div class="{{data.classes.product.quick}}">Quick View</div></div>{{/data.currentImage.srcLarge}}',
              },
              "classes": {
                "quick": "product-quick"
              },
              "styles": {
                "product": {
                  "font-family": '"Rubik", sans-serif',
                  "margin-bottom": "30px",
                  "imgWrapper": {
                    "background-color": "#F6F8FB",
                    "border-radius": "12px",
                    "height": "272px",
                    "display": "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "margin-bottom": "1rem",
                    "position": "relative",
                    "overflow": "hidden",
                    "img": {
                      "max-width": "75% !important",
                      "max-height": "75%",
                      "width": "auto",
                      "height": "auto"
                    },
                    ":hover": {
                      "quick": {
                        "transform": "translateY(0px)",
                      }
                    },
                  },
                  "quick": {
                    "transform": "translateY(62px)",
                    "background-color": "#3288ED",
                    "color": "white",
                    "font-size": "18px",
                    "font-weight": "bold",
                    "text-align": "center",
                    "height": "50px",
                    "display": "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "position": "absolute",
                    "bottom": "12px",
                    "left": "12px",
                    "right": "12px",
                    "border-radius": "8px",
                    "line-height": "1",
                    "transition": "transform 250ms, background-color 250ms",
                    ":hover": {
                      "background-color": "#0b4283",
                    }
                  },
                  "title": {
                    "font-weight": "400",
                    "margin-bottom": "6px",
                  },
                  "price": {
                    "font-weight": "700",
                    "font-size": "18px",
                  },
                },
              },
              "text": {
                "button": "View",
              }
            },
            "cart": {
              "popup": false,
              "contents": {
                "button": true
              },
              "styles": {
                "footer": {
                  "background-color": "#ffffff"
                }
              }
            },
            "modal": {
              "templates": {
                "contents": `<button class="{{data.classes.modal.close}}" data-element="modal.close">
                Back to Store
              </button>`,
              },
              "styles": {
                "modal": {
                  "border-radius": "12px",
                  "border": "none",
                },
                "close": {
                  "left": "45px",
                  "top": "18px",
                  "right": "auto",
                  "font-size": "16px",
                  "font-weight": "400",
                  "color": "#3288ED",
                  ":hover": {
                    "color": "#3288ED",
                    "transform": "none",
                  }
                }
              }
            },
            "modalProduct": {
              "contents": {
                "img": false,
                "imgWithCarousel": true,
                "variantTitle": false,
                "buttonWithQuantity": true,
                "button": false,
                "quantity": false
              },
              "styles": {
                "product": {
                  "padding": "55px 45px 45px",
                  "title": {
                    "font-weight": "400",
                    "font-size": "2.4375rem",
                    "line-height": "1.2",
                    "margin-bottom": "9px",
                  },
                  "price": {
                    "font-weight": "700",
                    "font-size": "1.92375rem",
                    "line-height": "calc(37/31)",
                    "margin-bottom": "30px",
                  },
                },
                "quantityInput": {
                  "border-radius": "8px !important",
                  "margin-right": "12px",
                  "border-top": "1px solid #B8C2CC",
                  "border-bottom": "1px solid #B8C2CC",
                  "border-left": "1px solid #B8C2CC",
                  "border-right": "1px solid #B8C2CC !important",
                  "height": "50px",
                },
                "button": {
                  "background-color": "#3288ED",
                  "border-radius": "8px !important",
                  "text-transform": "lowercase",
                  "font-weight": "700",
                  "font-size": "18px",
                  "height": "50px",
                  "width": "100%",
                  ":hover": {
                    "background-color": "#0b4283",
                  },
                  ":first-letter": {
                    "text-transform": "capitalize",
                  }
                },
                "buttonWithQuantity": {
                  "display": "flex",
                },
                "buttonWrapper": {
                  "flex-grow": "1",
                },
                "carouselNext": {
                  "display": "none"
                },
                "carouselPrevious": {
                  "display": "none"
                },
                "carouselItem": {
                  "border-radius": "12px",
                  "border": "2px solid white",
                  "width": "75px",
                  "height": "75px",
                },
                "carouselItemSelected": {
                  "border-color": "#3288ED",
                  "opacity": "1 !important",
                },
                "imgWrapper": {
                  "background-color": "#F6F8FB",
                  "border-radius": "12px",
                  "display": "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "position": "relative",
                  "padding-bottom": "130px",
                  "padding-top": "50px",
                },
                "carousel": {
                  "position": "absolute",
                  "bottom": "0",
                  "width": "100%",
                  "display": "flex",
                  "justify-content": "center",
                }
              }
            },
            "productSet": {
              "styles": {
                "products": {
                  "@media (min-width: 601px)": {
                    "margin-left": "-20px"
                  }
                },
                "paginationButton": {
                  "background-color": "#3288ED",
                  "font-weight": "700",
                  "font-size": "18px",
                  "height": "50px",
                  "border-radius": "8px",
                  "text-transform": "capitalize",
                }
              },
              text: {
                nextPageButton: 'Load more',
              },
            },
            "option": {
              "styles": {
                "wrapper": {                  
                  "border-radius": "8px",
                  "border-color": "#B8C2CC",
                  "select": {
                    "padding": "14px 20px 12px",
                  },
                },
              }
            },
            "cart": {
              "popup": false,
              "googleFonts": [
                "Rubik",
              ],
              "styles": {
                "cart": {
                  "font-family": '"Rubik", sans-serif',
                },
                "button": {
                  "background-color": "#3288ED",
                  "font-weight": "700",
                  "font-size": "18px",
                  "height": "50px",
                  "text-transform": "lowercase",
                  "border-radius": "8px",
                  ":hover": {
                    "background-color": "#0b4283",
                  },
                  ":first-letter": {
                    "text-transform": "capitalize",
                  }
                },
                "title": {
                  "font-size": "18px",
                  "font-weight": "700",
                  "line-height": "calc(28/18)",
                  "color": "#222B45",
                },
                "wrapper": {
                  "width": "381px",
                },
                "subtotalText": {
                  "font-weight": "700",
                  "color": "#222B45",
                  "font-size": "18px",
                  "line-height": "calc(28/18)",
                },
                "subtotal": {
                  "font-weight": "700",
                  "color": "#222B45",
                  "font-size": "18px",
                  "line-height": "calc(28/18)", 
                },
                "notice": {
                  "font-size": "12px",
                  "line-height": "1.5",
                  "color": "#708599",
                },
              }
            },
            "toggle": {
              "styles": {
                "toggle": {
                  "background-color": "#3288ED",
                  ":hover": {
                    "background-color": "#0b4283",
                  }
                }
              }
            },
            "lineItem": {
              "styles": {
                "image": {
                  "border-radius": "12px",
                  "background-color": "#F6F8FB",
                  "background-size": "90% auto",
                  "background-position": "center center",
                  "width": "90px",
                  "height": "90px",
                },
                "itemTitle": {
                  "font-size": "18px",
                  "line-height": "calc(28/18)",
                  "font-weight": "400",
                  "margin-left": "110px",
                },
                "variantTitle": {
                  "margin-bottom": "0",
                  "margin-left": "110px",
                  "line-height": "1.5",
                },
                "priceWithDiscounts": {
                  "float": "none",
                  "margin-left": "110px",
                  "text-align": "left",
                  "margin-bottom": "9px",
                },
                "price": {
                  "font-size": "18px",
                  "line-height": "calc(28/18)",
                  "font-weight": "700",
                },
                "quantityIncrement": {
                  "border-color": "#B8C2CC",
                  "height": "50px",
                  "width": "40px",
                },
                "quantityDecrement": {
                  "border-color": "#B8C2CC",
                  "height": "50px",
                  "width": "40px",
                },
                "quantityInput": {
                  "border-color": "#B8C2CC",
                  "height": "50px",
                },
                "quantity": {
                  "margin-right": "0",
                  "margin-left": "110px",
                },
                "lineItem": {
                  "border-bottom": "1px solid #E8E8E8",
                  "padding-bottom": "20px",
                },
              },
              "templates": {
                "quantity": `<div class="{{data.classes.lineItem.quantity}}" data-element="lineItem.quantity">
                  <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityDecrement}}" type="button" data-line-item-id="{{data.id}}" data-element="lineItem.quantityDecrement">
                    <svg width="15" height="1" viewBox="0 0 15 1" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="0.5" y2="0.5" stroke="black"/></svg><span class="visuallyhidden">{{data.text.quantityDecrementAccessibilityLabel}}</span>
                  </button>
                  <input class="{{data.classes.lineItem.quantityInput}}" type="number" min="0" aria-label="{{data.text.quantityInputAccessibilityLabel}}" data-line-item-id="{{data.id}}" value="{{data.quantity}}" data-element="lineItem.quantityInput">
                  <button class="{{data.classes.lineItem.quantityButton}} {{data.classes.lineItem.quantityIncrement}}" type="button" data-line-item-id="{{data.id}}" data-element="lineItem.quantityIncrement">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="7.5" y1="2.18557e-08" x2="7.5" y2="15" stroke="black"/><line x1="15" y1="7.5" y2="7.5" stroke="black"/></svg><span class="visuallyhidden">{{data.text.quantityIncrementAccessibilityLabel}}</span>
                  </button>
                </div>`,
              }
            }
          }
        });
      });
    }
  });

  return (
    <>
      <Header />
      <div className={styles.storePage}>
        <div className="container">
          <div className="row">
            <div className="col">
              {store}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export async function getServerSideProps(context) {
  console.log('serversise');
  const content = (await getStorePage()) || []
  return {
    props: { content }
  }
}
