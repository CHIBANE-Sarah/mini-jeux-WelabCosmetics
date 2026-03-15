FROM php:8.4-fpm-alpine

ARG USERNAME
ARG UID
ARG EMAIL
ARG NAME

# Installation des dépendances
RUN apk add --no-cache bash git curl sqlite-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite

# Installation de Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Installation de Symfony CLI
RUN wget https://get.symfony.com/cli/installer -O - | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Création de l'utilisateur 

RUN adduser -D -u "$UID" -s /bin/bash -h /home/$USERNAME $USERNAME

# Configuration Git
USER $USERNAME
RUN git config --global user.email "$EMAIL" \
    && git config --global user.name "$NAME"

WORKDIR /var/www/backend

EXPOSE 9000