const testimonials = document.querySelectorAll('.testimonial');
let currentSlide = 0;

document.querySelector('.next').addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % testimonials.length;
    updateCarousel();
});

document.querySelector('.prev').addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
    updateCarousel();
});

function updateCarousel() {
    testimonials.forEach((testimonial, index) => {
        testimonial.style.transform = `translateX(-${currentSlide * 100}%)`;
    });
}
// Rolagem suave da Página
document.querySelector('a[href="#planos"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#planos').scrollIntoView({
        behavior: 'smooth'
    });
});