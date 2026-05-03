# Image de base utilisée pour le backend Symfony.
# php:8.2-fpm-alpine contient PHP 8.2 avec PHP-FPM sur Alpine Linux.
FROM php:8.2-fpm-alpine

# Arguments passés depuis docker-compose.yml pendant le build de l’image.
# Ils servent ici à créer un utilisateur dans le conteneur et à configurer Git.
ARG USERNAME
ARG UID
ARG EMAIL
ARG NAME

# Installation des dépendances système nécessaires au projet.
# bash : shell utilisé dans certains scripts.
# git : utile pour Composer ou les commandes Git.
# curl : outil réseau.
# sqlite-dev : librairies nécessaires pour SQLite.
# docker-php-ext-install installe les extensions PHP PDO MySQL et PDO SQLite.
RUN apk add --no-cache bash git curl sqlite-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite

# Installation de Composer, le gestionnaire de dépendances PHP.
# Composer sert à installer les dépendances Symfony définies dans composer.json.
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Installation de Symfony CLI.
# Symfony CLI permet d’utiliser des commandes utiles pour développer/lancer Symfony.
RUN wget https://get.symfony.com/cli/installer -O - | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Création d'un utilisateur Linux dans le conteneur.
# Cela évite de travailler directement avec l'utilisateur root.
RUN adduser -D -u "$UID" -s /bin/bash -h /home/$USERNAME $USERNAME

# On passe sur l'utilisateur créé précédemment.
USER $USERNAME

# Configuration Git dans le conteneur avec le nom et l'email fournis.
RUN git config --global user.email "$EMAIL" \
    && git config --global user.name "$NAME"

# Dossier de travail du backend Symfony dans le conteneur.
WORKDIR /var/www/backend

# Port exposé par PHP-FPM.
# Nginx communiquera avec Symfony via ce port.
EXPOSE 9000