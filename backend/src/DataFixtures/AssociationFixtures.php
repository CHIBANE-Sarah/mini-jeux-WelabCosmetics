<?php

namespace App\DataFixtures;

use App\Entity\AssociationQuestion;
use App\Entity\Game;
use App\Entity\Session;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AssociationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // 1. Récupérer l'admin créé par UserFixtures
        //    La référence 'user_admin' est définie dans UserFixtures.php
        $admin = $this->getReference('user_admin', \App\Entity\User::class);

        // 2. Créer une session de test
        $session = new Session();
        $session->setTitreSession('Formation Cosmétique 2026');
        $session->setCodeSession('LAB2026');
        $session->setDuree(30);
        $session->setCreateur($admin);
        $manager->persist($session);

        // 3. Créer le jeu d'association lié à la session
        $game = new Game();
        $game->setType(Game::TYPE_ASSOCIATION);
        $game->setSession($session);
        $manager->persist($game);

        // 4. Questions d'association tirées des IHM du projet
        $questions = [
            [
                'terme'        => 'Conservateur',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Protège le produit des microorganismes',
            ],
            [
                'terme'        => 'Humectant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Retient l\'eau dans la formule',
            ],
            [
                'terme'        => 'Antioxydant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Prévient l\'oxydation des ingrédients',
            ],
            [
                'terme'        => 'Émulsifiant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Permet de mélanger l\'eau et l\'huile',
            ],
            [
                'terme'        => 'Tensioactif',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Diminue la tension superficielle',
            ],
        ];

        foreach ($questions as $data) {
            $question = new AssociationQuestion();
            $question->setTerme($data['terme']);
            $question->setDefinitions($data['definitions']);
            $question->setBonneReponse($data['bonneReponse']);
            $question->setGame($game);
            $manager->persist($question);
        }

        $manager->flush();
    }

    // Garantit que UserFixtures est chargée avant AssociationFixtures
    public function getDependencies(): array
    {
        return [UserFixtures::class];
    }
}