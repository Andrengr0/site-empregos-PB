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
        pauseOnHover: true,
        centerMode: true,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              autoplay: true,
              pauseOnHover: false,
            }
          },
          {
            breakpoint: 768,
            settings: {
              centerMode: true,
              pauseOnHover: false,
              slidesToShow: 2,
              autoplay: true,
            }
          },
          {
            breakpoint: 480,
            settings: {
              centerMode: true,
              pauseOnHover: false,
              pauseOnFocus: false,
              slidesToShow: 1,
              autoplay: true
            }
          }
        ]
      });

});

    