document.addEventListener('DOMContentLoaded', () => {

    // alert('Funcionou com sucesso');

    $('.apoiadores .container .box-apoiadores').slick({
        infinite: true,
        slidesToShow: 4,
        dots: false,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 1000,
        cssEase: 'ease',
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
            }
          }
        ]
      });

});

    